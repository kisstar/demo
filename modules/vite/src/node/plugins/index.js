import { preAliasPlugin } from './preAlias.js';
import { importAnalysisPlugin } from './importAnalysis.js';
import { resolvePlugin } from './resolve.js';

export async function resolvePlugins(config) {
  return [
    preAliasPlugin(config),
    resolvePlugin({ root: config.root, asSrc: true }),
    importAnalysisPlugin(config),
  ];
}
