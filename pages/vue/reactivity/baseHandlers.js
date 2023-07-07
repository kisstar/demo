import { track, trigger } from './effect/index.js';
import { TRACK_OPERATORS, TRIGGER_TYPES } from './effect/operators.js';
import { reactive, readonly } from './reactive.js';
import { isObject, isArray, isIntergerKey, hasOwn } from './utils.js';

function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    const value = Reflect.get(target, key, receiver);

    // 可能会被修改，所以需要手机依赖，等数据变化时重新更新
    if (!isReadonly) {
      track(target, key, TRACK_OPERATORS.GET);
    }

    // 取值时在非浅层代理模式下，如果是对象则再对值进行代理（也就是按需代理，懒代理）
    if (!isShallow && isObject(value)) {
      return isReadonly ? readonly(value) : reactive(value);
    }

    return value;
  };
}

function createSetter(isShallow = false) {
  return function set(target, key, value, receiver) {
    const oldValue = target[key];
    // 判断 key 是否是之前已经存在的
    const hadKey =
      isArray(target) && isIntergerKey(key)
        ? +key < target.length // 如果更改的属性是数组的索引，则判断索引是否在数组已有长度内
        : hasOwn(target, key);
    const isSuccess = Reflect.set(target, key, value, receiver);

    // 新增
    if (!hadKey) {
      trigger(target, TRIGGER_TYPES.ADD, key, value);
    } else if (oldValue !== value) {
      // 当数据变更时通知对应属性的 effect 执行
      trigger(target, TRIGGER_TYPES.SET, key, value, oldValue);
    }

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
