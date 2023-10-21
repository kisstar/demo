import connect from 'connect';
import { resolveConfig } from '../config.js';
import { resolveHttpServer } from '../http.js';
import { servePublicMiddleware } from './middlewares/static.js';

export async function createServer(inlineConfig) {
  const config = await resolveConfig(inlineConfig);
  const middlewares = connect();
  const httpServer = await resolveHttpServer(middlewares);

  middlewares.use(servePublicMiddleware(config.publicDir));

  return {
    listen(port = 3000) {
      httpServer.listen(port, async () => {
        console.log(`Server listening on http://localhost:${port}`);
      });
    },
  };
}
