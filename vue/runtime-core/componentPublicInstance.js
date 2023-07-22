import { hasOwn } from '../shared/index.js';

export const PublickInstanceStateHandlers = {
  get({ _: instance }, key) {
    // 不让获取以 $ 开头的内部属性
    if (key[0] === '$') {
      return;
    }

    const { props, setupState, data } = instance;

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    } else if (hasOwn(data, key)) {
      return data[key];
    }
  },

  set({ _: instance }, key, value) {
    if (key[0] === '$') {
      return;
    }

    const { props, setupState, data } = instance;

    if (hasOwn(setupState, key)) {
      setupState[key] = value;
    } else if (hasOwn(props, key)) {
      props[key] = value;
    } else if (hasOwn(data, key)) {
      data[key] = value;
    }

    return true;
  },
};
