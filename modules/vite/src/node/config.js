import path from 'node:path';

export async function resolveConfig(config = {}) {
  const root = config.root ? path.resolve(config.root) : process.cwd();
  const publicDir = config.publicDir ? path.resolve(config.publicDir) : root;

  const resolved = {
    root,
    publicDir,
  };

  return resolved;
}
