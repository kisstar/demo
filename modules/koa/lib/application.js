const http = require('http');
const request = require('./request');
const response = require('./response');
const context = require('./context');
const compose = require('../koa-compose');

module.exports = class Application {
  constructor() {
    // 确保每个实例都拥有自己的 request response context 三个对象
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);

    this.middleware = [];
  }

  use(fn) {
    this.middleware.push(fn);
  }

  createContext(req, res) {
    // 确保每次请求都拥有自己的 request response context 三个对象
    const context = Object.create(this.context);
    const request = (context.request = Object.create(this.request));
    const response = (context.response = Object.create(this.response));

    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;

    return context;
  }

  callback() {
    const fn = compose(this.middleware);
    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);

      this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }

  handleRequest(ctx, fnMiddleware) {
    const onerror = (err) => ctx.onerror(err);
    const handleResponse = () => respond(ctx);

    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  listen(...args) {
    const server = http.createServer(this.callback());

    return server.listen(...args);
  }
};

function respond(ctx) {
  ctx.res.end(ctx.body);
}
