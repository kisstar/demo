import { Node } from './Node.js';
import { Util } from './Util.js';

export const shapes = {};

export class Shape extends Node {
  constructor(config) {
    super(config);
    let key;

    while (true) {
      key = Util.getRandomColor();
      if (key && !(key in shapes)) {
        break;
      }
    }

    this.colorKey = key;
    shapes[key] = this;
  }

  getSceneFunc() {
    return this.config.sceneFunc || this['_sceneFunc'];
  }

  drawScene(canvas, top) {
    const cachingSelf = top === this;
    const cachedCanvas = this._getCanvasCache();
    const drawFunc = this.getSceneFunc();
    const context = canvas.context._context;

    context.save();
    if (cachedCanvas) {
      const { x = 0, y = 0 } = this.config;
      context.translate(x, y);
      this._drawCachedSceneCanvas(context);
    } else {
      if (!cachingSelf) {
        const { x = 0, y = 0 } = this.config;
        context.translate(x, y);
      }

      drawFunc.call(this, context, this);
    }
    context.restore();

    return this;
  }

  getHitFunc() {
    return this.config.hitFunc || this['_hitFunc'];
  }

  drawHit(canvas, top) {
    const cachingSelf = top === this;
    const drawFunc = this.getHitFunc() || this.getSceneFunc();
    const context = canvas.context._context;
    let cachedCanvas = this._getCanvasCache();
    const cachedHitCanvas = cachedCanvas && cachedCanvas.hit;

    context.save();
    if (cachedHitCanvas) {
      const { x = 0, y = 0 } = this.config;
      context.translate(x, y);
      this._drawCachedHitCanvas(context);
    } else {
      if (!cachingSelf) {
        const { x = 0, y = 0 } = this.config;
        context.translate(x, y);
      }

      drawFunc.call(this, context, this);
    }
    context.restore();

    return this;
  }
}

Shape.prototype.nodeType = 'Shape';
Shape.prototype.eventListeners = {};
