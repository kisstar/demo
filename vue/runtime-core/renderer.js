import { careateAppAPI } from './apiCreateApp.js';
import { ShapeFlags, isObject } from '../shared/index.js';
import { createComponentInstance, setupComponent } from './component.js';
import { effect } from '../reactivity/index.js';
import { createVNode, TEXT } from './vnode.js';
import { queueJob } from './scheduler.js';
import { getSequence } from './test.js';

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

  function patchKeyedChildren(c1, c2, el) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    // 从头开始比较，遇到不同的停止
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }

      i++;
    }

    // 从尾开始比较，遇到不同的停止
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    // 老的少，新的多
    if (i > e1) {
      // 表示有新增的部分
      if (i <= e2) {
        // 上面已经去掉了头部和尾部，剩下的就是中间存有差异的部分
        // 因为 i 是从前对比相同的递增，而 el 最大为旧的个数减 1，所以 i > el 说明旧的已经遍历完了
        // 因为，e1 和 e2 是同时减的，所以 e1 < i <= e2 说明新的必定比老的多

        const nextPos = e2 + 1;
        // 如果当前插入的孩子的索引加 1 小于总的长度的话说明其后面有其它元素
        // 所以直接取它后面的元素则为插入的参考点
        const anchor = nextPos < c2.length ? c2[nextPos].el : null;

        while (i <= e2) {
          patch(null, c2[i], el, anchor); // 向后追加新增的部分
          i++;
        }
      }

      // 老的多，新的少
    } else if (i > e2) {
      if (i <= e1) {
        while (i <= e1) {
          unmount(c1[i]);
          i++;
        }
      }

      // 乱序
    } else {
      let s1 = i;
      let s2 = i;

      const keyToIndexMap = new Map();

      for (let i = s2; i <= e2; i++) {
        const childVnode = c2[i];

        keyToIndexMap.set(childVnode.key, i);
      }

      const toBePatched = e2 - s2 + 1;
      const newIndexToOldIndex = new Array(toBePatched).fill(0);

      // 去老的中查找看有没有可以复用的
      for (let i = s1; i <= e1; i++) {
        const oldChildVnode = c1[i];
        const newIndex = keyToIndexMap.get(oldChildVnode.key);

        if (newIndex === undefined) {
          // 老的不在新的中则直接移除
          unmount(oldChildVnode);
        } else {
          // 如果旧的存在，就去更新
          patch(oldChildVnode, c2[newIndex], el);
          // 但此时只是单纯的更新，还没有处理顺序问题，所以这里先建立新旧之间的索引关系
          newIndexToOldIndex[newIndex - s2] = i + 1; // 元素在旧列表中的索引
        }
      }

      const increasingNewIndexSequence = getSequence(newIndexToOldIndex);
      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatched - 1; i >= 0; i--) {
        const currentIndex = s2 + i;
        const child = c2[currentIndex];
        const anchor =
          currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;

        // 为零说明没有对应的旧节点，直接挂载
        if (newIndexToOldIndex[i] === 0) {
          patch(null, child, el, anchor);
        } else {
          if (i !== increasingNewIndexSequence[j]) {
            hostInsert(child.el, el, anchor);
          } else {
            j--; // 跳过不需要移动的元素
          }
        }
      }
    }
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
          patchKeyedChildren(c1, c2, el);
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
