export const patchAttr = (el, key, value) => {
  if (value === null) {
    el.removeAttribuite(key);
  } else {
    el.setAttribute(key, value);
  }
};
