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

  hasChildren() {
    return this.getChildren().length > 0;
  }

  find(selector) {
    const result = [];

    this._find(this, selector, false, result);

    return result;
  }

  _find(node, selector, findOne, result) {
    const children = node.getChildren();

    for (const child of children) {
      const finded = child._isMatch(selector);

      if (finded) {
        result.push(child);

        if (findOne) {
          break;
        }
      } else {
        continue;
      }

      if (child.hasChildren()) {
        this._find(child, selector, findOne, result);
      }
    }
  }
}
