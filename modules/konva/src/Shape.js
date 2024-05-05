import { Node } from './Node.js';

export class Shape extends Node {
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
}
