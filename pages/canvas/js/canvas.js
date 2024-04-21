class Canvas {
  constructor(options) {
    this.options = options;
    this.el = options.el;

    const ctx = this.el.getContext('2d', options);

    this.ctx = ctx;
  }

  drawImage({ image, scale = 1 }) {
    this.ctx.save();
    const { width, height } = image;
    // 调整画布的大小
    this.el.width = width;
    this.el.height = height;

    const { width: swidth, height: sheight } = this.el;
    const { width: imageWidth, height: imageHeight } = image;
    const dwidth = imageWidth * scale;
    const dheight = imageHeight * scale;
    let x = 0;
    let y = 0;

    if (dwidth < swidth) {
      x = ((swidth - dwidth) / 2).toFixed(2);
    }
    if (dheight < sheight) {
      y = ((sheight - dheight) / 2).toFixed(2);
    }

    // 清除上一帧绘制
    this.ctx.clearRect(0, 0, swidth, sheight);
    // 绘制图片
    this.ctx.drawImage(
      image,
      0,
      0,
      imageWidth,
      imageHeight,
      x,
      y,
      dwidth,
      dheight
    );
    this.ctx.restore();
  }

  drawLine({ startX, startY, endX, endY }, options = {}) {
    this.ctx.save();
    this.ctx.beginPath();

    const {
      width = 20,
      color = 'black',
      globalCompositeOperation = 'destination-out',
    } = options;

    // 痕迹透明
    this.ctx.globalCompositeOperation = globalCompositeOperation;
    this.ctx.lineCap = 'round';
    this.ctx.lineioin = 'round';

    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    this.ctx.closePath();
    this.ctx.restore();
  }

  getImage() {
    return this.el.toDataURL('image/png');
  }

  getImageData() {
    const { width: swidth, height: sheight } = this.el;
    const imageData = this.ctx.getImageData(0, 0, swidth, sheight);

    return imageData;
  }

  replaceColor(oldColor = [255, 255, 255], newColor = [46, 99, 146]) {
    const imageData = this.getImageData();
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === oldColor[0]) {
        data[i] = newColor[0];
        data[i + 3] = 150;
      }
      if (data[i + 1] === oldColor[1]) data[i + 1] = newColor[1];
      if (data[i + 2] === oldColor[2]) data[i + 2] = newColor[2];
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  clear() {
    const { width, height } = this.el;

    this.ctx.clearRect(0, 0, width, height);
  }
}
