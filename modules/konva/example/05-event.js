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

rect.on('mousedown', function () {
  console.log('mousedown: ', this);
});
rect.on('mouseup', function () {
  console.log('mouseup: ', this);
});
rect.on('click', function () {
  console.log('click: ', this);
});

layer.add(rect);
stage.add(layer);
