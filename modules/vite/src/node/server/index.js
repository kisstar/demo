import connect from 'connect';
import { resolveConfig } from '../config.js';
import { resolveHttpServer } from '../http.js';
import { servePublicMiddleware } from './middlewares/static.js';
import { initDepsOptimizer } from '../optimizer/index.js';

export async function createServer(inlineConfig) {
  const config = await resolveConfig(inlineConfig);
  const middlewares = connect();
  const httpServer = await resolveHttpServer(middlewares);

  middlewares.use(servePublicMiddleware(config.publicDir));

  const server = {
    async listen(port = 3000) {
      httpServer.listen(port, async () => {
        console.log(`Server listening on http://localhost:${port}`);
      });
    },
  };
  const listen = httpServer.listen.bind(httpServer);

  httpServer.listen = async function (...args) {
    await initDepsOptimizer(config, server);
    listen(...args);
  };

  return server;
}
