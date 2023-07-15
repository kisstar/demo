import { nodeOps } from './nodeOps.js';
import { patchProp } from './patchProp.js';
import { createRenderer } from '../runtime-core/index.js';

const rendererOptions = Object.assign({}, nodeOps, { patchProp });

export function createApp(rootComp, props) {
  const app = createRenderer(rendererOptions).createApp(rootComp, props);
  const { mount } = app;

  app.mount = function (selector) {
    const container = nodeOps.querySelector(selector);

    // 清空容器
    container.innerHTML = '';

    // 将组件渲染成 DOM 挂载容器中
    mount(container);
  };

  return app;
}
