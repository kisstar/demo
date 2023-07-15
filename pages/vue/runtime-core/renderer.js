import { careateAppAPI } from './apiCreateApp.js';

export function createRenderer(rendererOptions) {
  function render(vnode, container) {}

  return {
    createApp: careateAppAPI(render),
  };
}
