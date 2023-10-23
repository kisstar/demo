import path from 'node:path';
import fs from 'node:fs';
import { isWindows } from '../utils.js';

export function resolvePlugin({ root, asSrc }) {
  return {
    name: 'vite:resolve',
    async resolveId(id, importer, resolveOpts) {
      // URL
      // /foo -> /fs-root/foo
      if (asSrc && id[0] === '/' && !id.startsWith(root)) {
        const fsPath = path.resolve(root, id.slice(1));

        return { id: fsPath };
      }
      if (isWindows && id.startsWith('/')) {
        return {
          id: path.resolve(root, id.slice(1)),
        };
      }
      if (path.isAbsolute(id)) {
        return { id };
      }
      if (id.startsWith('.')) {
        const basedir = importer ? path.dirname(importer) : process.cwd();
        const fsPath = path.resolve(basedir, id);

        return {
          id: fsPath,
        };
      }

      const resolved = tryNodeResolve(id, importer, { root });

      if (resolved) return resolved;
    },
  };
}

export function tryNodeResolve(id, importer, { root }) {
  const pkgPath = path.join(root, 'node_modules', id, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const entry = path.join(path.dirname(pkgPath), pkg.module || pkg.main);

  return { id: entry };
}
