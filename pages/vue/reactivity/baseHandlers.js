import { reactive, readonly } from './reactive.js';
import { isObject } from './utils.js';

function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    const value = Reflect.get(target, key, receiver);

    // 可能会被修改，所以需要手机依赖，等数据变化时重新更新
    if (!isReadonly) {
    }

    // 取值时在非浅层代理模式下，如果是对象则再对值进行代理（也就是按需代理，懒代理）
    if (!isShallow && isObject(value)) {
      return isReadonly ? readonly(value) : reactive(value);
    }

    return value;
  };
}

function createSetter(isShallow = false) {
  return function set(target, key, receiver) {
    const isSuccess = Reflect.set(target, key, key, receiver);

    return isSuccess;
  };
}

const get = createGetter();

const shallowGet = createGetter(false, true);

const readonlyGet = createGetter(true);

const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();

const shallowSet = createGetter(true);

export const mutableHandlers = {
  get,
  set,
};

export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set: () => {
    console.warn('Target is readonly!');
  },
};

export const shallowReadonlyHandlers = {
  get: shallowReadonlyGet,
  set: () => {
    console.warn('Target is readonly!');
  },
};
