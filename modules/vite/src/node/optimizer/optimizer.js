import path from 'node:path';
import { scanImports } from './scan.js';
import { flattenId } from '../utils.js';
import { runOptimizeDeps } from './index.js';

export async function initDepsOptimizer(config, server) {
  await createDepsOptimizer(config, server);
}

async function createDepsOptimizer(config, server) {
  const discover = discoverProjectDependencies(config);
  const metadata = {
    optimized: {},
    discovered: {},
  };
  const deps = await discover.result;

  for (const id of Object.keys(deps)) {
    if (!metadata.discovered[id]) {
      addMissingDep(id, deps[id]);
    }
  }

  const knownDeps = prepareKnownDeps();
  const optimizationResult = runOptimizeDeps(config, knownDeps);

  function addMissingDep(id, resolved) {
    metadata.discovered[id] = {
      id,
      file: path.resolve(config.cacheDir, 'deps', flattenId(id) + '.js'),
      src: resolved,
    };
  }

  function prepareKnownDeps() {
    const knownDeps = {};
    for (const dep of Object.keys(metadata.optimized)) {
      knownDeps[dep] = { ...metadata.optimized[dep] };
    }
    for (const dep of Object.keys(metadata.discovered)) {
      const { processing, ...info } = metadata.discovered[dep];
      knownDeps[dep] = info;
    }
    return knownDeps;
  }
}

export function discoverProjectDependencies(config) {
  const { result } = scanImports(config);

  return {
    result: result.then(({ deps }) => deps),
  };
}
