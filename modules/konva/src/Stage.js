import { Container } from './Container.js';

const PX = 'px';

export class Stage extends Container {
  constructor(config) {
    super(config);
    const { container } = config;
    this.setContainer(container);
    this._buildDOM();
  }

  setContainer(container) {
    container = document.getElementById(container);

    if (!container) {
      throw 'Can not find container in document with id ' + id;
    }

    this.container = container;
    return this;
  }

  add(layer) {
    const { width, height } = this.config;
    super.add(layer);
    layer.setSize({ width, height });
    layer.draw();
    this.content.appendChild(layer.canvas._canvas);
    return this;
  }

  _buildDOM() {
    this.content = document.createElement('div');
    this.container.appendChild(this.content);
    this._resizeDOM();
  }

  _resizeDOM() {
    const { width, height } = this.config;

    if (this.content) {
      // set content dimensions
      this.content.style.width = width + PX;
      this.content.style.height = height + PX;
    }
  }
}
