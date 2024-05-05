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
}
