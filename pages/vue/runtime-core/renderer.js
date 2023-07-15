import { careateAppAPI } from './apiCreateApp.js';
import { ShapeFlags } from '../shared/index.js';
import { createComponentInstance, setupComponent } from './component.js';

export function createRenderer(rendererOptions) {
  function setupRenderEffect() {}

  function mountComponent(initVnode, container) {
    // 获取 setup() 函数的返回值，并调用 render() 函数的结果进行渲染
    // 1、创建实例
    const instance = (initVnode.component = createComponentInstance(initVnode));
    // 2、将需要的数据解析到实例上
    setupComponent(instance);
    // 3、创建一个 effect 让组件的 render() 方法执行
    setupRenderEffect();
  }

  function processComponent(n1, n2, container) {
    if (n1 === null) {
      // 旧的虚拟节点不存在进行初次挂载
      mountComponent(n2, container);
    } else {
      // 更新
    }
  }

  function patch(n1, n2, container) {
    const { shapeFlag } = n2;

    if (shapeFlag & ShapeFlags.ELEMENT) {
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      processComponent(n1, n2, container);
    }
  }

  function render(vnode, container) {
    patch(null, vnode, container);
  }

  return {
    createApp: careateAppAPI(render),
  };
}
