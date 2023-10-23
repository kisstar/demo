import { send } from '../send.js';
import { transformRequest } from '../transformRequest.js';

export function transformMiddleware(server) {
  return async function viteTransformMiddleware(req, res, next) {
    if (req.method !== 'GET') {
      return next();
    }

    let url = req.url;

    if (/\.js|vue/.test(url)) {
      const result = await transformRequest(url, server);

      if (result) {
        const type = 'js';
        return send(req, res, result.code, type);
      }
    } else {
      return next();
    }
  };
}
