import { scanImports } from './scan.js';

export async function initDepsOptimizer(config, server) {
  await createDepsOptimizer(config, server);
}

async function createDepsOptimizer(config, server) {
  const discover = discoverProjectDependencies(config);

  const deps = await discover.result;

  console.log('deps: ', deps);
}

export function discoverProjectDependencies(config) {
  const { result } = scanImports(config);

  return {
    result: result.then(({ deps }) => deps),
  };
}
