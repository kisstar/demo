import { Konva } from './Global.js';
import { SceneCanvas, HitCanvas } from './Canvas.js';

const CANVAS = 'canvas';

export class Node {
  _cache = new Map();
  _filters = [];

  constructor(config) {
    this.config = config;
  }

  draw() {
    this.drawScene();
    this.drawHit();
    return this;
  }

  moveToTop() {
    if (!this.parent) {
      return false;
    }
    var index = this.index,
      len = this.parent.getChildren().length;
    if (index < len - 1) {
      this.parent.children.splice(index, 1);
      this.parent.children.push(this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }

  _requestDraw() {
    if (Konva.autoDrawEnabled) {
      const drawNode = this.getLayer() || this.getStage();
      drawNode?.batchDraw();
    }
  }

  getParent() {
    return this.parent;
  }

  getLayer() {
    var parent = this.getParent();
    return parent ? parent.getLayer() : null;
  }

  getStage() {
    return this._getStage();
  }

  _getStage() {
    var parent = this.getParent();
    if (parent) {
      return parent.getStage();
    } else {
      return null;
    }
  }

  _getCanvasCache() {
    return this._cache.get(CANVAS);
  }

  cache() {
    const { width, height } = this.config;
    const cachedSceneCanvas = new SceneCanvas({
        width: width,
        height: height,
      }),
      cachedFilterCanvas = new SceneCanvas({
        width: 0,
        height: 0,
        willReadFrequently: true,
      }),
      cachedHitCanvas = new HitCanvas({
        width: width,
        height: height,
      }),
      sceneContext = cachedSceneCanvas.context._context;

    cachedHitCanvas.isCache = true;
    cachedSceneCanvas.isCache = true;
    this._cache.delete(CANVAS);
    sceneContext.save();
    this.drawScene(cachedSceneCanvas, this);
    this.drawHit(cachedHitCanvas, this);
    sceneContext.restore();
    this._cache.set(CANVAS, {
      scene: cachedSceneCanvas,
      filter: cachedFilterCanvas,
      hit: cachedHitCanvas,
    });
    this._requestDraw();

    return this;
  }

  _drawCachedSceneCanvas(context) {
    context.save();
    const cacheCanvas = this._getCachedSceneCanvas();
    context.drawImage(
      cacheCanvas._canvas,
      0,
      0,
      cacheCanvas.width,
      cacheCanvas.height
    );
    context.restore();
  }

  _getCachedSceneCanvas() {
    var filters = this.filters(),
      cachedCanvas = this._getCanvasCache(),
      sceneCanvas = cachedCanvas.scene,
      filterCanvas = cachedCanvas.filter,
      filterContext = filterCanvas.context._context,
      len,
      imageData,
      n,
      filter;

    if (filters) {
      filterCanvas.setSize(sceneCanvas.width, sceneCanvas.height);
      len = filters.length;
      filterContext.clearRect(0, 0, filterCanvas.width, filterCanvas.height);

      // copy cached canvas onto filter context
      filterContext.drawImage(
        sceneCanvas._canvas,
        0,
        0,
        sceneCanvas.width,
        sceneCanvas.height
      );
      imageData = filterContext.getImageData(
        0,
        0,
        filterCanvas.width,
        filterCanvas.height
      );

      // apply filters to filter context
      for (n = 0; n < len; n++) {
        filter = filters[n];
        filter.call(this, imageData);
        filterContext.putImageData(imageData, 0, 0);
      }

      return filterCanvas;
    }

    return sceneCanvas;
  }

  _drawCachedHitCanvas(context) {
    const canvasCache = this._getCanvasCache(),
      hitCanvas = canvasCache.hit;
    context.save();
    // context.translate(canvasCache.x, canvasCache.y);
    context.drawImage(
      hitCanvas._canvas,
      0,
      0,
      hitCanvas.width,
      hitCanvas.height
    );
    context.restore();
  }

  filters(filters) {
    if (filters) {
      this._filters = filters;
    }

    return this._filters;
  }

  hasChildren() {
    return false;
  }

  hasName(name) {
    if (!name) {
      return false;
    }
    const fullName = this.config.name;
    const names = (fullName || '').split(/\s/g);
    return names.indexOf(name) !== -1;
  }

  _isMatch(selectorOrFunction) {
    if (!selectorOrFunction) {
      return false;
    }
    if (typeof selectorOrFunction === 'function') {
      return selectorOrFunction(this);
    }
    let selectorArr = selectorOrFunction.replace(/ /g, '').split(','),
      len = selectorArr.length,
      n,
      sel;

    for (n = 0; n < len; n++) {
      sel = selectorArr[n];

      // id selector
      if (sel.charAt(0) === '#') {
        if (this.config.id === sel.slice(1)) {
          return true;
        }
      } else if (sel.charAt(0) === '.') {
        // name selector
        if (this.hasName(sel.slice(1))) {
          return true;
        }
      } else if (this.className === sel || this.nodeType === sel) {
        return true;
      }
    }

    return false;
  }
}

Node.prototype.nodeType = 'Node';
