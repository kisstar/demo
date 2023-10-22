import path from 'node:path';
import fs from 'node:fs';
import esbuild from 'esbuild';
export { initDepsOptimizer } from './optimizer.js';
import { flattenId } from '../utils.js';

export function runOptimizeDeps(resolvedConfig, depsInfo) {
  const metadata = {
    optimized: {},
    discovered: {},
  };
  const { cacheDir } = resolvedConfig;
  const depsCacheDir = path.resolve(cacheDir, 'deps');

  fs.mkdirSync(depsCacheDir, { recursive: true }); // 实际上vite会先创建一个临时目录，创建完之后进行重命名
  fs.writeFileSync(
    path.resolve(depsCacheDir, 'package.json'),
    `{\n  "type": "module"\n}\n`
  );

  const preparedRun = prepareEsbuildOptimizerRun(
    resolvedConfig,
    depsInfo,
    depsCacheDir
  );
  const runResult = preparedRun.then(({ context, idToExports }) => {
    return context.rebuild().then((result) => {
      metadata.optimized = { ...depsInfo };

      return {
        metadata,
        commit: async () => {
          const metadataPath = path.join(depsCacheDir, '_metadata.json');

          fs.writeFileSync(
            metadataPath,
            stringifyDepsOptimizerMetadata(metadata, depsCacheDir)
          );
        },
      };
    });
  });

  return { result: runResult };
}

async function prepareEsbuildOptimizerRun(
  resolvedConfig,
  depsInfo,
  processingCacheDir
) {
  const flatIdDeps = {};

  Object.keys(depsInfo).map((id) => {
    const src = depsInfo[id].src;
    const flatId = flattenId(id);
    flatIdDeps[flatId] = src;
  });

  const context = await esbuild.context({
    absWorkingDir: process.cwd(),
    entryPoints: Object.keys(flatIdDeps),
    outdir: processingCacheDir,
    bundle: true,
    format: 'esm',
    splitting: true,
    sourcemap: true,
  });

  return { context };
}

function stringifyDepsOptimizerMetadata(metadata, depsCacheDir) {
  const { optimized } = metadata;
  return JSON.stringify(
    {
      optimized: Object.fromEntries(
        Object.values(optimized).map(({ id, src, file }) => [
          id,
          {
            src,
            file,
          },
        ])
      ),
    },
    (key, value) => {
      if (key === 'file' || key === 'src') {
        return path.relative(depsCacheDir, value);
      }
      return value;
    },
    2
  );
}
