import path from 'node:path';
import { resolvePlugin } from './plugins/resolve.js';

export async function resolveConfig(config = {}) {
  const root = config.root ? path.resolve(config.root) : process.cwd();
  const publicDir = config.publicDir ? path.resolve(config.publicDir) : root;

  const resolved = {
    root,
    publicDir,
    plugins: [resolvePlugin({ root })],
  };

  return resolved;
}
