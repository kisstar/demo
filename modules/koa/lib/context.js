const delegate = require('../delegates');

const context = (module.exports = {
  onerror(err) {
    const msg = err.stack || err.toString();

    console.error(msg);
  },
});

delegate(context, 'response')
  // ...
  .access('body');

delegate(context, 'request')
  .method('get')
  // ...
  .access('method');
