import { patchClass } from './modules/class.js';
import { patchStyle } from './modules/style.js';
import { patchAttr } from './modules/attr.js';
import { patchEvent } from './modules/events.js';

export const patchProp = (el, key, preValue, nextValue) => {
  switch (key) {
    case 'class':
      patchClass(el, nextValue);
      break;
    case 'style':
      patchStyle(el, preValue, nextValue);
      break;
    default:
      // 是否是事件
      if (/^on[^a-z]/.test(key)) {
        patchEvent(el, key, nextValue);
      } else {
        patchAttr(el, key, nextValue);
      }
      break;
  }
};
