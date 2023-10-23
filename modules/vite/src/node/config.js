import path from 'node:path';
import { resolvePlugins } from './plugins/index.js';

export async function resolveConfig(config = {}) {
  const root = config.root ? path.resolve(config.root) : process.cwd();
  const publicDir = config.publicDir ? path.resolve(config.publicDir) : root;
  // resolve cache directory
  const cacheDir = config.cacheDir
    ? path.resolve(config.cacheDir)
    : path.join(root, 'node_modules/.vite');

  const resolved = {
    root,
    publicDir,
    cacheDir,
    plugins: [],
  };

  resolved.plugins = await resolvePlugins(resolved);

  return resolved;
}
