import { nodeOps } from './nodeOps.js';
import { patchProp } from './patchProp.js';

const rendererOptions = Object.assign({}, nodeOps, { patchProp });

export { rendererOptions };
