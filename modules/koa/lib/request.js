module.exports = {
  get method() {
    // 直接获取原生请求对象上对应的属性
    return this.req.method;
  },

  set method(val) {
    this.req.method = val;
  },
};
