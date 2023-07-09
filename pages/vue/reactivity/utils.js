export const isObject = (value) => typeof value === 'object' && value !== null;

export const isArray = Array.isArray;

export const isIntergerKey = (value) => parseInt(value) + '' === value;

export const hasOwn = (target, key) =>
  Object.prototype.hasOwnProperty.call(target, key);

export const isFunction = (value) => typeof value === 'function';
