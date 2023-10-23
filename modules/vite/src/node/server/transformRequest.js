import fsp from 'node:fs/promises';

export async function transformRequest(url, server) {
  const { pluginContainer } = server;
  const { id } = await pluginContainer.resolveId(url);
  const loadResult = await pluginContainer.load(id);
  let code;

  if (loadResult) {
    code = loadResult.code;
  } else {
    code = await fsp.readFile(id, 'utf-8');
  }

  const transformResult = await pluginContainer.transform(code, id);

  return transformResult;
}
