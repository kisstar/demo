import { isFunction } from '../utils.js';
import { effect, track, trigger } from '../effect/index.js';
import { TRACK_OPERATORS, TRIGGER_TYPES } from '../effect/operators.js';

// computed 接受一个 getter 函数，返回一个只读的响应式 ref 对象
// 传递的 getter 函数默认不会执行，只在获取时才会触发执行；而且多次获取也会有缓存，只在变更后再次读取时才会执行

class ComputedRefImpl {
  __v_dirty = true;
  _value;

  constructor(getter, setter) {
    this.getter = getter;
    this.setter = setter;
    this.effect = effect(getter, {
      // 创建一个 effect 用于在取值时进行调用，以便让子级（getter 中的计算属性）记录对当前的依赖
      // 如此在 effect 内部依赖的计算属性变化时就会调用该 effect 函数来更新脏标识
      lazy: true, // 默认不执行
      scheduler: () => {
        if (!this.__v_dirty) {
          this.__v_dirty = true;
          // 当内部依赖的计算属性变化时，除了更新脏标识外，还需要通知依赖了该计算属性的父级，让其知道计算属性的值发生了变化
          // 如果存在父级依赖了计算属性，就会调用父级的 efect 函数执行，其中就会再次获取计算属性的值，也就会获取到最新的值
          trigger(this, TRIGGER_TYPES.SET, 'value');
        }
      },
    });
  }

  get value() {
    if (this.__v_dirty) {
      this._value = this.effect();
      this.__v_dirty = false;
    }

    // 和普通响应式对象一样在取值时进行依赖收集
    track(this, 'value', TRACK_OPERATORS.GET);

    return this._value;
  }

  set value(newValue) {
    this.setter(newValue);
  }
}

export function computed(getterOrOptions) {
  let getter, setter;

  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => console.warn('Target is readonly!');
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
}
