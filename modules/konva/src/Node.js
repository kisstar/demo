import { Konva } from './Global.js';

export class Node {
  constructor(config) {
    this.config = config;
  }

  draw() {
    this.drawScene();
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
}
