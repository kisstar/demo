export class Context {
  constructor(canvas) {
    this.canvas = canvas;
  }
}

export class SceneContext extends Context {
  constructor(canvas, { willReadFrequently = false } = {}) {
    super(canvas);
    this._context = canvas._canvas.getContext('2d', {
      willReadFrequently,
    });
  }
}
