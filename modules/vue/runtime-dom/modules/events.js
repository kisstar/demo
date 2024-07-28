// 以事件名为 key 在对应的元素上添加一个事件缓存
// 如果没有注册过对应的事件，就创建一个处理处理并放入缓存中
// 后续存在缓存时更新注册的事件，就直接更新处理器中调用函数的引用
export const patchEvent = (el, key, value) => {
  const invokers = el._vei || (el._vei = {});
  const eventName = key.slice(2).toLowerCase();
  const exists = el._vei[eventName];

  if (exists) {
    if (value) {
      exists.value = value;
    } else {
      el.removeEventListener(eventName, exists);
      invokers[eventName] = undefined;
    }
  } else {
    if (value) {
      const invoker = createInvoker(value);

      invokers[eventName] = invoker;
      el.addEventListener(eventName, invoker);
    }
  }
};

function createInvoker(fn) {
  const invoker = (e) => {
    invoker.value(e);
  };

  invoker.value = fn;

  return invoker;
}
