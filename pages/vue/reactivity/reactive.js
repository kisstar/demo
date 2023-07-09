import { isObject } from './utils.js';
import {
  mutableHandlers,
  shallowReactiveHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers.js';

export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers);
}

export function shallowRective(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers);
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers);
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers);
}

// 添加代理缓存避免重复代理
const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();

// 函数柯里化：是不是仅读、深度
export function createReactiveObject(target, isReadonly, baseHandlers) {
  // Proxy 不能对非对象进行代理，所以 reactive API 不能处理费对象类型
  if (!isObject(target)) {
    return target;
  }

  const proxyMap = isReadonly ? readonlyMap : reactiveMap;
  const existProxy = proxyMap.get(target);

  if (existProxy) {
    return existProxy;
  }

  const newProxy = new Proxy(target, baseHandlers);

  proxyMap.set(target, newProxy);

  return newProxy;
}
