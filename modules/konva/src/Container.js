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
  }

  drawScene(canvas) {
    this._drawChildren('drawScene', canvas);
  }

  _drawChildren(drawMethod, canvas) {
    this.children?.forEach(function (child) {
      child[drawMethod](canvas);
    });
  }
}
