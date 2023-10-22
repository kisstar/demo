export async function createPluginContainer(config) {
  const { plugins } = config;
  const container = {
    async resolveId(rawId, importer = join(root, 'index.html')) {
      for (const plugin of plugins) {
        if (!plugin.resolveId) continue;

        const result = await plugin.resolveId(rawId, importer);

        if (result) return result;

        return { id: rawId };
      }
    },
  };

  return container;
}
