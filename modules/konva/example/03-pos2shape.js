import Konva from '../src/index.js';

var stage = new Konva.Stage({
  container: 'container',
  width: 600,
  height: 400,
});
var layer = new Konva.Layer();
var rect = new Konva.Rect({
  x: 200,
  y: 150,
  width: 200,
  height: 100,
  fill: 'red',
});

rect.cache();
rect.filters([Konva.Filters.Grayscale]);
layer.add(rect);
stage.add(layer);

console.log(
  layer.getIntersection({
    x: 100,
    y: 100,
  })
);
console.log(
  layer.getIntersection({
    x: 600 / 2,
    y: 400 / 2,
  })
);
