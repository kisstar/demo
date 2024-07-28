export const patchClass = (el, nextValue) => {
  let value = nextValue;

  if (value === null) {
    value = '';
  }

  el.className = value;
};
