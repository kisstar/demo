import { Shape } from '../Shape.js';

export class Rect extends Shape {
  _sceneFunc(context) {
    const { width = 200, height = 100, fill = 'red' } = this.config;

    context.beginPath();
    context.rect(0, 0, width, height);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
  }

  _hitFunc(context) {
    const { width = 200, height = 100 } = this.config;

    context.beginPath();
    context.rect(0, 0, width, height);
    context.closePath();
    context.fillStyle = this.colorKey;
    context.fill();
  }
}

Rect.prototype.className = 'Rect';
