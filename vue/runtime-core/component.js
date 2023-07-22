import { ShapeFlags, isFunction, isObject } from '../shared/index.js';
import { PublickInstanceStateHandlers } from './componentPublicInstance.js';

export function createComponentInstance(vnode) {
  // 组件有属性，插槽等核心概念
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    attrs: {},
    slots: {},
    setupState: {}, // setup() 方法返回的数据
    isMounted: false, // 是否挂载过
    // vue2:
    data: {},
    // watch: {},
  };

  instance.ctx = { _: instance };

  return instance;
}

export function setupComponent(instance) {
  const { vnode } = instance;
  const { props, children } = vnode;

  // 将解析出来的 props、attrs 放到实例上
  instance.props = props; // TODO: initProps()
  instance.children = children; // TODO: // initSlots()

  const isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT;

  // 是否是有状态的组件
  if (isStateful) {
    setupStatefulComponent(instance);
  }
}

function setupStatefulComponent(instance) {
  // 1、代理传递给 render() 函数的参数
  instance.proxy = new Proxy(instance.ctx, PublickInstanceStateHandlers);
  // 2、获取组件的类型，拿到对应的 setup() 方法
  const component = instance.type;
  const { setup } = component;

  if (setup) {
    const setupContext = createSetupContext(instance);
    const setupResult = setup(instance.props, setupContext);

    handleSetupResult(instance, setupResult);
  } else {
    finishSetupComponent(instance);
  }
}

function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    // props: instance.props,
    exporse: () => {},
    emit: () => {},
  };
}

function finishSetupComponent(instance) {
  const component = instance.type;
  const { render } = instance;

  if (!render) {
    // TODO: 对模版进行编译得到 render() 函数，将结果赋值给 component
    instance.render = component.render;
  }
}

function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult;
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult;
  }

  finishSetupComponent(instance);
}
