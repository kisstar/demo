import { Container } from './Container.js';
import { SceneCanvas, HitCanvas } from './Canvas.js';
import { Util } from './Util.js';
import { shapes } from './Shape.js';

const HASH = '#';

export class Layer extends Container {
  canvas = new SceneCanvas();
  hitCanvas = new HitCanvas();
  _waitingForDraw = false;

  drawScene() {
    Container.prototype.drawScene.call(this, this.canvas);

    return this;
  }

  drawHit() {
    Container.prototype.drawHit.call(this, this.hitCanvas);

    return this;
  }

  setSize({ width, height }) {
    this.canvas.setSize(width, height);
    this.hitCanvas.setSize(width, height);

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

  getIntersection(pos) {
    const obj = this._getIntersection(pos);
    return obj.shape;
  }

  _getIntersection(pos) {
    const p = this.hitCanvas.context._context.getImageData(
      Math.round(pos.x),
      Math.round(pos.y),
      1,
      1
    ).data;

    const colorKey = Util._rgbToHex(p[0], p[1], p[2]);
    const shape = shapes[HASH + colorKey];
    if (shape) {
      return {
        shape: shape,
      };
    }
    return {};
  }
}

Layer.prototype.nodeType = 'Layer';
