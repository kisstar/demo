import { createVNode } from './vnode.js';

export function careateAppAPI(render) {
  return function createApp(rootComp, props) {
    const app = {
      __props: props,
      __component: rootComp,
      __container: null,
    };

    // 根据组件创建虚拟 DOM
    // 将得到的虚拟 DOM 和 容器交给 render() 函数进行渲染
    app.mount = function (container) {
      app.__container = container;

      const vnode = createVNode(rootComp, props);

      render(vnode, container);
    };

    return app;
  };
}
