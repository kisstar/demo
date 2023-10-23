import { init, parse } from 'es-module-lexer';
import MagicString from 'magic-string';

export function importAnalysisPlugin(config) {
  const { root } = config;
  let server = null;

  return {
    name: 'vite:import-analysis',
    configureServer(_server) {
      server = _server;
    },
    async transform(source, importer, options) {
      if (!server) {
        return null;
      }

      await init;

      let imports = parse(source)[0];

      if (!imports.length) {
        return source;
      }

      let ms = new MagicString(source);

      const normalizeUrl = async (url) => {
        const resolved = await this.resolve(url, importer); // 调用插件上下文上的 resolve 方法

        if (resolved.id.startsWith(root + '/')) {
          url = resolved.id.slice(root.length);
        }

        return url;
      };

      for (let index = 0; index < imports.length; index++) {
        const { s: start, e: end, n: specifier } = imports[index];

        if (specifier) {
          const normalizedUrl = await normalizeUrl(specifier);

          if (normalizedUrl !== specifier) {
            ms.overwrite(start, end, normalizedUrl);
          }
        }
      }

      return ms.toString();
    },
  };
}
