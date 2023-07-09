import { ref, effectScope } from './vue.js';
import { piniaSymbol } from './rootStore.js';

export function createPinia() {
  const scope = effectScope();
  const state = scope.run(() => ref({}));
  const pinia = {
    _e: scope,
    _s: new Map(), // 存放所有的 store 信息
    install(app) {
      // 让所有的 store 都可以获取到 pinia 对象，然后就可以存储到 Map 中
      app.provide(piniaSymbol, pinia);
      // 让所有的组件也可以访问
      app.config.globalProperties.$pinia = pinia;
    },
    state,
  };

  return pinia;
}
