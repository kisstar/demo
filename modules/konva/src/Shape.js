import { Node } from './Node.js';

export class Shape extends Node {
  getSceneFunc() {
    return this.config.sceneFunc || this['_sceneFunc'];
  }

  drawScene(canvas) {
    const drawFunc = this.getSceneFunc();
    const context = canvas.context._context;

    context.save();
    drawFunc.call(this, context, this);
    context.restore();

    return this;
  }
}
