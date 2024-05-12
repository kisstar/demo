const ZERO = '0',
  HASH = '#';

export const Util = {
  createCanvasElement() {
    return document.createElement('canvas');
  },

  getRandomColor() {
    var randColor = ((Math.random() * 0xffffff) << 0).toString(16);
    while (randColor.length < 6) {
      randColor = ZERO + randColor;
    }
    return HASH + randColor;
  },

  _rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
};
