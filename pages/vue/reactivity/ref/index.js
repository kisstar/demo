import { track, trigger } from '../effect/index.js';
import { TRACK_OPERATORS, TRIGGER_TYPES } from '../effect/operators.js';
import { isObject, isArray } from '../utils.js';
import { reactive } from '../reactive.js';

// ref 主要是为了解决普通类型的响应式，当然你也可以传递对象
// 解决的思路是将普通类型转换为对象
export function ref(value) {
  return createRef(value);
}

export function shallowRef(value) {
  return createRef(value, true);
}

class RefImpl {
  constructor(value, isShallow) {
    this.__v_isRef = true; // 私有属性标识是一个 ref 对象
    this.rawValue = value;
    this.isShallow = isShallow;
    this._value = isShallow || !isObject(value) ? value : reactive(value);
  }

  get value() {
    track(this, 'value', TRACK_OPERATORS.GET);

    return this._value;
  }

  set value(newValue) {
    if (this.rawValue !== newValue) {
      this.rawValue = newValue;
      this._value =
        this.isShallow || !isObject(newValue) ? newValue : reactive(newValue);
      trigger(this, TRIGGER_TYPES.SET, 'value', newValue, this.rawValue);
    }
  }
}

function createRef(value, isShallow = false) {
  return new RefImpl(value, isShallow);
}

class ObjectRefImpl {
  constructor(target, key) {
    this.__v_isRef = true;
    this.target = target;
    this.key = key;
  }

  get value() {
    return this.target[this.key];
  }

  set value(newValue) {
    this.target[this.key] = newValue;
  }
}

// 将一个对象的 key 转换为响应式
export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}

export function toRefs(target) {
  const newObj = isArray(target) ? new Array(target.length) : {};

  for (let key in target) {
    newObj[key] = toRef(target, key);
  }

  return newObj;
}
