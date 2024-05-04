import { Container } from './Container.js';
import { SceneCanvas } from './Canvas.js';

export class Layer extends Container {
  canvas = new SceneCanvas();
  _waitingForDraw = false;

  drawScene() {
    Container.prototype.drawScene.call(this, this.canvas);

    return this;
  }

  setSize({ width, height }) {
    this.canvas.setSize(width, height);

    return this;
  }

  getLayer() {
    return this;
  }

  getStage() {
    return this.parent;
  }

  batchDraw() {
    if (!this._waitingForDraw) {
      this._waitingForDraw = true;
      requestAnimationFrame(() => {
        this.draw();
        this._waitingForDraw = false;
      });
    }
    return this;
  }
}
