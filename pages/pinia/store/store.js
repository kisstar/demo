import {
  getCurrentInstance,
  inject,
  reactive,
  effectScope,
  computed,
  isRef,
  isReactive,
  toRefs,
} from './vue.js';
import { piniaSymbol } from './rootStore.js';
import { isObject, isFunction } from './utils.js';

function isComputed(v) {
  return isRef(v) && v.effect;
}

function mergeReactiveObject(target, state) {
  for (const key in state) {
    const oldValue = target[key];
    const newValue = state[key];

    if (isObject(oldValue) && isObject(newValue)) {
      target[key] = mergeReactiveObject(oldValue, newValue);
    } else {
      target[key] = newValue;
    }
  }
}

function createSetupStore(id, setup, pinia, isOptions) {
  function $patch(paritialStateOrMutatiot) {
    if (isObject(paritialStateOrMutatiot)) {
      mergeReactiveObject(pinia.state.value[id], paritialStateOrMutatiot);
    } else if (isFunction(paritialStateOrMutatiot)) {
      paritialStateOrMutatiot(pinia.state.value[id]);
    }
  }

  const paritialStore = { $patch };
  const initialState = pinia.state.value[id];
  const store = reactive(paritialStore); // 每个 store 就是一个响应式对象
  let scope;

  if (!initialState && !isOptions) {
    pinia.state.value[id] = {};
  }

  const setupStore = pinia._e.run(() => {
    scope = effectScope();

    return scope.run(() => setup());
  });

  function wrapAction(name, fun) {
    return function (...args) {
      return fun.call(store, ...args);
    };
  }

  for (let key in setupStore) {
    const value = setupStore[key];

    if (typeof value === 'function') {
      setupStore[key] = wrapAction(key, value);
    }
    if ((isRef(value) && !isComputed(value)) || isReactive(value)) {
      if (!isOptions) {
        pinia.state.value[id][key] = value;
      }
    }
  }

  pinia._s.set(id, store);
  Object.assign(store, setupStore);

  return store;
}

function createOptionsStore(id, options, pinia) {
  const { state, getters, actions } = options;

  function setup() {
    pinia.state.value[id] = state ? state() : {};
    const localState = toRefs(pinia.state.value[id]);

    return Object.assign(
      localState,
      actions,
      Object.keys(getters || {}).reduce((memo, name) => {
        memo[name] = computed(() => {
          const store = pinia._s.get(id);

          return getters[name].call(store);
        });

        return memo;
      }, {})
    );
  }

  return createSetupStore(id, setup, pinia, true);
}

export function defineStore(idOrOptions, setup) {
  const isSetupStore = typeof setup === 'function';
  let id, options;

  if (typeof idOrOptions === 'string') {
    id = idOrOptions;
    options = setup;
  } else {
    id = idOrOptions.id;
    options = idOrOptions;
  }

  function useStore() {
    // 根据 Vue 模块提供的方法获取当前的应用
    const app = getCurrentInstance();
    // 如果存在说明是在 Vue 组件中在使用，此时可以通过 Vue 提供的 inject() API 获取之前注入的 pinia 对象
    const pinia = app && inject(piniaSymbol);

    if (!pinia._s.has(id)) {
      if (isSetupStore) {
        createSetupStore(id, setup, pinia);
      } else {
        createOptionsStore(id, options, pinia);
      }
    }

    const store = pinia._s.get(id);

    return store;
  }

  return useStore;
}
