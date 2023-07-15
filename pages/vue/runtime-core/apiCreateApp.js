export function careateAppAPI(render) {
  return function createApp(rootComp, props) {
    const app = {};

    // 根据组件创建虚拟 DOM
    // 将得到的虚拟 DOM 和 容器交给 render() 函数进行渲染
    app.mount = function (container) {
      let vnode = {};

      render(vnode, container);
    };

    return app;
  };
}
