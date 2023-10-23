import {
  parse,
  compileScript,
  rewriteDefault,
  compileTemplate,
} from 'vue/compiler-sfc';
import fs from 'node:fs';

const descriptorCache = new Map();

export default function vuePlugin() {
  return {
    name: 'vue',
    async transform(code, id) {
      const [filename] = id.split('?');

      return filename.endsWith('.vue')
        ? await transformMain(code, filename)
        : null;
    },
  };
}

async function transformMain(source, filename) {
  const descriptor = await createDescriptor(filename);
  const scriptCode = genScriptCode(descriptor, filename);
  const templateCode = genTemplateCode(descriptor, filename);
  let resolvedCode = [
    templateCode,
    scriptCode,
    `_sfc_main['render'] = render`,
    `export default _sfc_main`,
  ].join('\n');

  return { code: resolvedCode };
}

async function createDescriptor(filename) {
  let descriptor = descriptorCache.get(filename);

  if (descriptor) return descriptor;

  const content = await fs.promises.readFile(filename, 'utf8');
  const result = parse(content, { filename });

  descriptor = result.descriptor;
  descriptorCache.set(filename, descriptor);

  return descriptor;
}

function genTemplateCode(descriptor, id) {
  const content = descriptor.template.content;
  const result = compileTemplate({ source: content, id });

  return result.code;
}

function genScriptCode(descriptor, id) {
  let scriptCode = '';
  let script = compileScript(descriptor, { id });

  if (!script.lang) {
    scriptCode = rewriteDefault(script.content, '_sfc_main');
  }

  return scriptCode;
}
