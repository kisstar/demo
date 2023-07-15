import { careateAppAPI } from './apiCreateApp.js';
import { ShapeFlags, isObject } from '../shared/index.js';
import { createComponentInstance, setupComponent } from './component.js';
import { effect } from '../reactivity/index.js';
import { createVNode, TEXT } from './vnode.js';

export function createRenderer(rendererOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
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

  function mountElement(vnode, container) {
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

    hostInsert(el, container);
  }

  function processElement(n1, n2, container) {
    if (n1 === null) {
      mountElement(n2, container);
    } else {
      // 更新
    }
  }

  // -------------------- 处理组件 ------------------------

  function setupRenderEffect(instance, container) {
    instance.update = effect(function componentEffect() {
      if (!instance.isMounted) {
        instance.isMounted = true;

        const subTree = instance.render.call(instance.proxy, instance.proxy);

        instance.subTree = subTree;

        patch(null, subTree, container);
      } else {
        // 更新
      }
    });
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

  function patch(n1, n2, container) {
    const { shapeFlag, type } = n2;

    switch (type) {
      case TEXT:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container);
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
