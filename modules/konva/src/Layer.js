import { Container } from './Container.js';
import { SceneCanvas } from './Canvas.js';

export class Layer extends Container {
  canvas = new SceneCanvas();

  drawScene() {
    Container.prototype.drawScene.call(this, this.canvas);

    return this;
  }

  setSize({ width, height }) {
    this.canvas.setSize(width, height);

    return this;
  }
}
