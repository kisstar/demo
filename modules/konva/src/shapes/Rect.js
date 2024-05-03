import { Shape } from '../Shape.js';

export class Rect extends Shape {
  _sceneFunc(context) {
    const {
      x = 200,
      y = 150,
      width = 200,
      height = 100,
      fill = 'red',
    } = this.config;

    context.beginPath();
    context.rect(x, y, width, height);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
  }
}
