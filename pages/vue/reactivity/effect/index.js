import { isArray, isIntergerKey } from '../utils.js';
import { TRIGGER_TYPES } from '../effect/operators.js';

let uid = 0; // 制作一个 effect 的唯一标识
let activeEffect; // 当前活动的 effect
/**
// 为了避免下面的情况需要使用栈来记录当前活动的 effect
effect(() => { // set activeEffect = effect1
  state.name = 'Sharon'

  effect(() => { // set activeEffect = effect2
    state.age = 18
  })

  // now activeEffect is effect2, but activeEffect should be effect1
  state.address = 'earth'
})
 */
let effectStack = [];

export function effect(fn, options = {}) {
  const effect = createReactiveEffect(fn, options);

  // 响应式的 effect 默认会执行
  if (!options.lazy) effect();
}

function createReactiveEffect(fn, options) {
  const effect = function () {
    /**
    // 避免以下情况重复添加 effect
    effect(() => {
      state.count++
    })
    */
    if (effectStack.includes(effect)) {
      return;
    }

    try {
      effectStack.push(effect);
      activeEffect = effect;
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };

  effect.id = uid++;
  effect._isEffect = true; // 用作响应式 effect 的标识
  effect.raw = fn;
  effect.options = options;

  return effect;
}

// 某个对象下的某个属性对应的 effect，每个属性对应的 effect 可能是多个
const targeMap = new WeakMap();

export function track(target, key, operator) {
  if (!activeEffect) {
    // 说明属性不在 effect 中使用，所以不用收集依赖
    return;
  }

  let depsMap = targeMap.get(target);

  if (!depsMap) {
    targeMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);

  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
  }
}

function addEffect(effects, effectSet) {
  if (effects && effectSet) {
    effectSet.forEach((effect) => effects.add(effect));
  }
}

export function trigger(target, type, key, newValue, oldValue) {
  const depsMap = targeMap.get(target);

  if (!depsMap) {
    return;
  }

  // 收集要执行的 effect 最终一起执行
  const effects = new Set();

  // 修改是数组的 length 属性
  if (isArray(target) && key === 'length') {
    depsMap.forEach((depSet, key) => {
      // 如果收集的依赖中包含了 length 属性的依赖，以及索引大于更改的长度值对应的依赖都应该被执行
      // eg: const value = arr[2]; arr.length = 1; // 此时原本索引为 2 的值已经变成了未定义
      if (key === 'length' || key > newValue) {
        addEffect(effects, depSet);
      }
    });
  } else {
    // 如果是更改的情况
    if (key !== undefined) {
      addEffect(effects, depsMap.get(key));
    }

    switch (type) {
      case TRIGGER_TYPES.ADD:
        // 如果修改的属性是数组的索引，则将 length 属性的依赖添加进去
        // eg: const value = arr[2]; arr[99] = 1; // 此时length 将会变成 100
        if (isArray(target) && isIntergerKey(key)) {
          addEffect(effects, depsMap.get('length'));
        }
    }
  }

  effects.forEach((effect) => effect());
}
