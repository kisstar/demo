async function loadImage(url) {
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function getImageData(url) {
  const image = await loadImage(url);
  const { width, height } = image;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, width, height);

  return imageData;
}

const imgUtils = {
  loadImage,
  getImageData,
};
