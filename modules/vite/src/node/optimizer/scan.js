import path from 'node:path';
import fsp from 'node:fs/promises';
import esbuild from 'esbuild';
import { createPluginContainer } from '../server/pluginContainer.js';

export function scanImports(config) {
  const deps = {};
  const entries = [path.resolve(config.root, 'index.html')]; // 默认抓取 index.html 来检测需要预构建的依赖项
  const result = prepareEsbuildScanner(config, entries, deps).then(
    (esbuildContext) => {
      return esbuildContext.rebuild().then(() => ({
        deps,
      }));
    }
  );

  return { result };
}

async function prepareEsbuildScanner(config, entries, deps) {
  const container = await createPluginContainer(config);
  const plugin = esbuildScanPlugin(config, container, deps);

  return await esbuild.context({
    absWorkingDir: process.cwd(),
    write: false,
    stdin: {
      contents: entries.map((e) => `import ${JSON.stringify(e)}`).join('\n'),
      loader: 'js',
    },
    bundle: true,
    format: 'esm',
    logLevel: 'silent',
    plugins: [plugin],
  });
}

function esbuildScanPlugin(config, container, deps) {
  const resolve = async (id, importer, options) => {
    const resolved = await container.resolveId(id, importer, {
      ...options,
      scan: true,
    });
    const res = resolved?.id;

    return res;
  };

  return {
    name: 'vite:dep-scan',
    setup(build) {
      build.onResolve({ filter: /\.html$/ }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer);

        return {
          path: resolved,
          namespace: 'html',
        };
      });
      build.onLoad(
        { filter: /\.html$/, namespace: 'html' },
        async ({ path }) => {
          const html = await fsp.readFile(path, 'utf-8');
          const [, scriptSrc] = html.match(/src="(.+)"/);

          return {
            loader: 'js',
            contents: `import ${JSON.stringify(scriptSrc)}`,
          };
        }
      );
      // 处理其它类型的文件
      build.onResolve({ filter: /.*/ }, async ({ path: id, importer }) => {
        const resolved = await resolve(id, importer);

        if (resolved.includes('node_modules')) {
          deps[id] = resolved;

          return {
            path: resolved,
            external: true,
          };
        }

        return {
          path: resolved,
        };
      });
      build.onLoad({ filter: /\.js$/ }, async ({ path: id }) => {
        const ext = path.extname(id).slice(1);
        const contents = await fsp.readFile(id, 'utf-8');

        return {
          loader: ext,
          contents,
        };
      });
    },
  };
}
