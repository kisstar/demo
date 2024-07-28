export const patchStyle = (el, preValue, nextValue) => {
  const style = el.style;

  /*
    若新的样式为空，则直接移除样式

    old:
    { color: 'red' }
    new:
    { }
  */
  if (nextValue === null) {
    el.removeAttribute('style');
  } else {
    // 老的有的，新的没有则需要移除
    for (let key in preValue) {
      if (nextValue[key] === null) {
        style[key] = '';
      }
    }

    // 新的样式有的，则需要将新的复制给旧的
    // 不用关系老的里面有没有，有则更新，无则新增
    for (let key in nextValue) {
      style[key] = nextValue[key];
    }
  }
};
