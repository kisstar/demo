function Delegator(proto, target) {
  if (!(this instanceof Delegator)) return new Delegator(proto, target);

  this.proto = proto;
  this.target = target;
}

Delegator.prototype.method = function (name) {
  const proto = this.proto;
  const target = this.target;

  // 调用时这里的 this 就是上下文对象，target 则是 request 或 response
  // 所以，最终都会交给请求对象或响应对象上的方法去处理
  proto[name] = function () {
    return this[target][name].apply(this[target], arguments);
  };

  return this;
};

Delegator.prototype.access = function (name) {
  return this.getter(name).setter(name);
};

Delegator.prototype.getter = function (name) {
  const proto = this.proto;
  const target = this.target;

  proto.__defineGetter__(name, function () {
    return this[target][name];
  });

  return this;
};

Delegator.prototype.setter = function (name) {
  const proto = this.proto;
  const target = this.target;

  proto.__defineSetter__(name, function (val) {
    return (this[target][name] = val);
  });

  return this;
};

module.exports = Delegator;
