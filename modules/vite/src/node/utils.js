import os from 'node:os';

export const isWindows = os.platform() === 'win32';

export const flattenId = (id) => {
  return id
    .replace(/[/:]/g, '_')
    .replace(/\./g, '__')
    .replace(/(\s*>\s*)/g, '___')
    .replace(/#/g, '____');
};
