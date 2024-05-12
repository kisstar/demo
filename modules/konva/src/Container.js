import { Node } from './Node.js';

export class Container extends Node {
  constructor(config) {
    super(config);
    this.children = [];
  }

  add(child) {
    child.index = this.children.length;
    child.parent = this;

    this.children.push(child);
    this._requestDraw();
  }

  drawScene(canvas) {
    this._drawChildren('drawScene', canvas);
  }

  drawHit(canvas) {
    this._drawChildren('drawHit', canvas);
  }

  _drawChildren(drawMethod, canvas) {
    this.children?.forEach(function (child) {
      child[drawMethod](canvas);
    });
  }

  getChildren() {
    return this.children;
  }

  _setChildrenIndices() {
    this.children?.forEach(function (child, n) {
      child.index = n;
    });
    this._requestDraw();
  }
}
