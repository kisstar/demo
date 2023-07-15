import { ShapeFlags, isArray, isString } from '../shared/index.js';

export function createVNode(type, props, children = null) {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    el: null, // 真实 DOM
    key: props.key,
    shapeFlag,
  };

  normalizeChildren(vnode, children);

  return vnode;
}

function normalizeChildren(vnode, children) {
  let type = 0;

  if (children === null) {
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    type = ShapeFlags.TEXT_CHILDREN;
  }

  vnode.shapeFlag |= type;
}
