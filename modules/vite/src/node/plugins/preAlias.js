import {
  getDepsOptimizer,
  optimizedDepInfoFromId,
} from '../optimizer/index.js';

const bareImportRE = /^(?![a-zA-Z]:)[\w@](?!.*:\/\/)/;

export function preAliasPlugin(config) {
  return {
    name: 'vite:pre-alias',
    async resolveId(id, importer, options) {
      const depsOptimizer = getDepsOptimizer(config);

      if (
        importer &&
        depsOptimizer &&
        bareImportRE.test(id) &&
        !options?.scan
      ) {
        // tryOptimizedResolve
        await depsOptimizer.scanProcessing;
        const metadata = depsOptimizer.metadata;
        const depInfo = optimizedDepInfoFromId(metadata, id);

        if (depInfo) return depsOptimizer.getOptimizedDepId(depInfo);
      }
    },
  };
}
