import { Util } from './Util.js';
import { SceneContext, HitContext } from './Context.js';

export class Canvas {
  constructor() {
    this._canvas = Util.createCanvasElement();
  }

  setSize(width, height) {
    this.setWidth(width || 0);
    this.setHeight(height || 0);
  }

  setWidth(width) {
    this.width = this._canvas.width = width;
    this._canvas.style.width = width + 'px';
  }

  setHeight(height) {
    // take into account pixel ratio
    this.height = this._canvas.height = height;
    this._canvas.style.height = height + 'px';
  }
}

export class SceneCanvas extends Canvas {
  constructor(config = { width: 0, height: 0, willReadFrequently: false }) {
    super(config);
    this.context = new SceneContext(this, {
      willReadFrequently: config.willReadFrequently,
    });
    this.setSize(config.width, config.height);
  }
}

export class HitCanvas extends Canvas {
  hitCanvas = true;
  constructor(config = { width: 0, height: 0 }) {
    super(config);

    this.context = new HitContext(this);
    this.setSize(config.width, config.height);
  }
}
