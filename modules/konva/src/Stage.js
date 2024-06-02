import { Container } from './Container.js';

const PX = 'px';
const MOUSEENTER = 'mouseenter',
  MOUSEMOVE = 'mousemove',
  MOUSELEAVE = 'mouseleave',
  MOUSEDOWN = 'mousedown',
  MOUSEUP = 'mouseup',
  CONTEXTMENU = 'contextmenu',
  WHEEL = 'wheel';
const EVENTS = [
  [MOUSEENTER, '_pointerenter'],
  [MOUSEDOWN, '_pointerdown'],
  [MOUSEMOVE, '_pointermove'],
  [MOUSEUP, '_pointerup'],
  [MOUSELEAVE, '_pointerleave'],
  [WHEEL, '_wheel'],
  [CONTEXTMENU, '_contextmenu'],
];

export class Stage extends Container {
  constructor(config) {
    super(config);
    const { container } = config;
    this.setContainer(container);
    this._buildDOM();
    this._bindContentEvents();
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

  batchDraw() {
    this.getChildren().forEach(function (layer) {
      layer.batchDraw();
    });
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

  _eventHandleBack(methodName) {
    console.log(
      `对不起，${methodName} 事件的回调函数还没有定义，您可以自行继续完善！`
    );
  }

  // 当前仅列举了部分事件，提供了部分事件的回调函数
  _bindContentEvents() {
    EVENTS.forEach(([event, methodName]) => {
      this.content.addEventListener(
        event,
        (evt) => {
          this[methodName]
            ? this[methodName](evt)
            : this._eventHandleBack(event);
        },
        { passive: false }
      );
    });
  }

  getIntersection(pos) {
    if (!pos) {
      return null;
    }
    let layers = this.children,
      len = layers.length,
      end = len - 1,
      n;

    for (n = end; n >= 0; n--) {
      const shape = layers[n].getIntersection(pos);
      if (shape) {
        return shape;
      }
    }

    return null;
  }

  _getContentPosition() {
    const rect = this.content.getBoundingClientRect();

    return {
      top: rect.top,
      left: rect.left,
    };
  }

  setPointersPositions(evt) {
    const contentPosition = this._getContentPosition();
    const x = evt.clientX - contentPosition.left;
    const y = evt.clientY - contentPosition.top;

    this.pointerPos = { x, y };
    this._pointerPositions = [{ x, y }];
    this._changedPointerPositions = [{ x, y }];
  }

  _pointerdown(evt) {
    this.setPointersPositions(evt);
    this._changedPointerPositions.forEach((pos) => {
      const shape = this.getIntersection(pos);

      if (!shape) {
        return;
      }

      shape._fireAndBubble('mousedown', {
        evt: evt,
      });
    });
  }

  _pointerup(evt) {
    this.setPointersPositions(evt);
    this._changedPointerPositions.forEach((pos) => {
      const shape = this.getIntersection(pos);

      if (!shape) {
        return;
      }

      shape._fireAndBubble('mouseup', {
        evt: evt,
      });
      shape._fireAndBubble('click', {
        evt: evt,
      });
    });
  }
}

Stage.prototype.nodeType = 'Stage';
