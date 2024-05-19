import Konva from '../src/index.js';

var stage = new Konva.Stage({
  container: 'container',
  width: 600,
  height: 400,
});
var layer = new Konva.Layer();
var rect0 = new Konva.Rect({
  id: 'rect0',
  name: 'rect',
  x: 150,
  y: 125,
  width: 200,
  height: 100,
  fill: 'red',
});
var rect1 = new Konva.Rect({
  id: 'rect1',
  name: 'rect',
  x: 250,
  y: 175,
  width: 200,
  height: 100,
  fill: 'yellow',
});

layer.add(rect0);
layer.add(rect1);
stage.add(layer);

console.log(layer.find('#rect1'));
console.log(layer.find('.rect'));
console.log(stage.find('Layer'));
