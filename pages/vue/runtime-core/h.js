import { isArray, isObject } from '../shared/index.js';
import { createVNode, isVnode } from './vnode.js';

// children 要么是字符串，要么就是数组
export function h(type, propsOrChildren, children) {
  const length = arguments.length;

  if (length === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }

      return createVNode(type, propsOrChildren);
    } else {
      // propsOrChildren 一定是孩子
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (length === 3 && isVnode(children)) {
      children = [children];
    } else if (length > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    }

    return createVNode(type, propsOrChildren, children);
  }
}
