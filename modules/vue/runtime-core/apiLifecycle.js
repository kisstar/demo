import { currentInstance, setCurrentInstance } from './component.js';

const LifecycleHooks = {
  BEFORE_MOUNT: 'bm',
  MOUNTED: 'm',
  BEFORE_UPDATE: 'bu',
  UPDATED: 'u',
};

function injectHook(type, hook, target) {
  if (!target) {
    console.warn('Miss target!');
    return;
  }

  const hooks = target[type] || (target[type] = []);

  const warp = () => {
    setCurrentInstance(target);
    hook.call(target);
    setCurrentInstance(null);
  };

  hooks.push(warp);
}

function createHook(lifecycle) {
  return function (hook, target = currentInstance) {
    injectHook(lifecycle, hook, target);
  };
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHooks.UPDATED);

export const invokeFunctionList = (fns) => {
  fns.forEach((fn) => fn());
};
