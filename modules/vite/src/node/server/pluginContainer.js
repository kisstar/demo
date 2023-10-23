import path from 'node:path';

export async function createPluginContainer(config) {
  const { plugins } = config;

  class PluginContext {
    async resolve(id, importer = path.join(config.root, 'index.html')) {
      let out = await container.resolveId(id, importer);

      if (typeof out === 'string') out = { id: out };

      return out;
    }
  }

  const container = {
    async resolveId(
      rawId,
      importer = path.join(config.root, 'index.html'),
      options
    ) {
      const ctx = new PluginContext();
      const scan = !!options?.scan;

      ctx._scan = scan;

      for (const plugin of plugins) {
        if (!plugin.resolveId) continue;

        const result = await plugin.resolveId.call(ctx, rawId, importer, {
          scan,
        });

        if (!result) continue;

        return result;
      }

      return { id: rawId };
    },
    async load(id) {
      const ctx = new PluginContext();

      for (const plugin of plugins) {
        if (!plugin.load) continue;
        const result = await plugin.load.call(ctx, id);

        if (result !== null) {
          return result;
        }
      }

      return null;
    },
    async transform(code, id) {
      const ctx = new PluginContext();

      for (const plugin of plugins) {
        if (!plugin.transform) continue;

        const result = await plugin.transform.call(ctx, code, id);

        if (!result) continue;

        code = result.code || result;
      }

      return { code };
    },
  };

  return container;
}
