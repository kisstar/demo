function compose(middlewares) {
  return function (ctx) {
    let index = -1;

    const dispatch = (i = 0) => {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }

      index = i;

      const middleware = middlewares[i];

      if (i === middlewares.length) {
        return Promise.resolve();
      }

      return Promise.resolve(middleware(ctx, () => dispatch(i + 1)));
    };

    return dispatch();
  };
}

module.exports = compose;
