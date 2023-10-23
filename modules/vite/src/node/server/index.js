import connect from 'connect';
import { resolveConfig } from '../config.js';
import { resolveHttpServer } from '../http.js';
import { servePublicMiddleware } from './middlewares/static.js';
import { transformMiddleware } from './middlewares/transform.js';
import { initDepsOptimizer } from '../optimizer/index.js';
import { createPluginContainer } from './pluginContainer.js';

export async function createServer(inlineConfig) {
  const config = await resolveConfig(inlineConfig);
  const middlewares = connect();
  const httpServer = await resolveHttpServer(middlewares);
  const container = await createPluginContainer(config);
  const server = {
    pluginContainer: container,
    async listen(port = 3000) {
      httpServer.listen(port, async () => {
        console.log(`Server listening on http://localhost:${port}`);
      });
    },
  };

  for (const plugin of config.plugins) {
    if (plugin.configureServer) {
      await plugin.configureServer(server);
    }
  }

  // main transform middleware
  middlewares.use(transformMiddleware(server));
  middlewares.use(servePublicMiddleware(config.publicDir));

  const listen = httpServer.listen.bind(httpServer);

  httpServer.listen = async function (...args) {
    await initDepsOptimizer(config, server);
    listen(...args);
  };

  return server;
}
