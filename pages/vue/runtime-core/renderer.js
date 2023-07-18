import { careateAppAPI } from './apiCreateApp.js';
import { ShapeFlags, isObject } from '../shared/index.js';
import { createComponentInstance, setupComponent } from './component.js';
import { effect } from '../reactivity/index.js';
import { createVNode, TEXT } from './vnode.js';
import { queueJob } from './scheduler.js';

export function createRenderer(rendererOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    nextSibling: hostNextSibling,
  } = rendererOptions;

  // -------------------- 处理文本 ------------------------
  function processText(n1, n2, container) {
    if (n1 === null) {
      hostInsert(hostCreateText(n2.children), container);
    } else {
      // 更新
    }
  }

  // -------------------- 处理元素 ------------------------

  function normalizeVnode(child) {
    if (isObject(child)) {
      return child;
    }

    return createVNode(TEXT, null, String(child));
  }

  function mountChildren(children, el) {
    for (let i = 0; i < children.length; i++) {
      const child = normalizeVnode(children[i]);

      patch(null, child, el);
    }
  }

  function mountElement(vnode, container, anchor = null) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));

    for (let key in props) {
      hostPatchProp(el, key, null, props[key]);
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }

    hostInsert(el, container, anchor);
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      hostRemove(children[i]);
    }
  }

  function pathChildren(n1, n2, el) {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const nextShapeFlag = n2.shapeFlag;

    // 新的孩子是文本
    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧的孩子是一个数组则先依次移除
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }

      // 前后都是文本，则直接用新的文本替换
      if (c2 !== c1) {
        hostSetElementText(el, c2);
      }
    } else {
      // 进入这里说明现在孩子是数组或者没有孩子
      // 若以前是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 且现在也是数组
        if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        } else {
          // 到这里就说明现在没有孩子，所以移除之前的
          unmountChildren(c1);
        }
      } else {
        // 进入这里说明旧的孩子是文本，或者没有
        // 如果旧的是文本，就直接设为空相当于移除
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '');
        }

        // 现在是数组，就把新的依次挂载上去
        if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  }

  function pathProps(oldProps, newProps, el) {
    if (oldProps !== newProps) {
      // 新的里面有且不与旧的相同的，直接更新
      for (let key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];

        if (prev !== next) {
          hostPatchProp(el, key, prev, next);
        }
      }

      // 旧里面有，在新的没有旧移除
      for (let key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, prev, null);
        }
      }
    }
  }

  function pathElement(n1, n2, container) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    pathProps(oldProps, newProps, el);
    pathChildren(n1, n2, el);
  }

  function processElement(n1, n2, container, anchor = null) {
    if (n1 === null) {
      mountElement(n2, container, anchor);
    } else {
      // 更新
      pathElement(n1, n2, container);
    }
  }

  // -------------------- 处理组件 ------------------------

  function setupRenderEffect(instance, container) {
    instance.update = effect(
      function componentEffect() {
        if (!instance.isMounted) {
          instance.isMounted = true;

          const subTree = instance.render.call(instance.proxy, instance.proxy);

          instance.subTree = subTree;

          patch(null, subTree, container);
        } else {
          // 更新
          const preTree = instance.subTree;
          const nextTree = instance.render.call(instance.proxy, instance.proxy);

          patch(preTree, nextTree, container);
        }
      },
      {
        scheduler: function (effect) {
          queueJob(effect);
        },
      }
    );
  }

  function mountComponent(initVnode, container) {
    // 获取 setup() 函数的返回值，并调用 render() 函数的结果进行渲染
    // 1、创建实例
    const instance = (initVnode.component = createComponentInstance(initVnode));
    // 2、将需要的数据解析到实例上
    setupComponent(instance);
    // 3、创建一个 effect 让组件的 render() 方法执行
    setupRenderEffect(instance, container);
  }

  function processComponent(n1, n2, container) {
    if (n1 === null) {
      // 旧的虚拟节点不存在进行初次挂载
      mountComponent(n2, container);
    } else {
      // 更新
    }
  }

  // -------------------- 主逻辑 ------------------------

  function isSameVnode(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }

  function unmount(n) {
    hostRemove(n.el);
  }

  function patch(n1, n2, container, anchor = null) {
    const { shapeFlag, type } = n2;

    if (n1 && !isSameVnode(n1, n2)) {
      anchor = hostNextSibling(n1.el);
      unmount(n1); // 移除老节点
      n1 = null; // 将旧节点设置为 null 对 n2 进行首次挂载，完成新节点的添加
    }

    switch (type) {
      case TEXT:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container);
        }
    }
  }

  function render(vnode, container) {
    patch(null, vnode, container);
  }

  return {
    createApp: careateAppAPI(render),
  };
}
