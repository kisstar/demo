// 创建舞台，绑定我们添加的容器
import Konva from '../src/index.js';

var stage = new Konva.Stage({
  container: 'container',
  width: 600,
  height: 400,
});
//创建用户层
var layer = new Konva.Layer();
// 创建一个矩形对象
var rect = new Konva.Rect({
  x: 200, // 矩形左上角 x 坐标
  y: 150, // 矩形左上角 y 坐标
  width: 200,
  height: 100,
  fill: 'red',
});

// 向用户层中添加上面的矩形
layer.add(rect);
// 将上面的用户层添加到舞台
stage.add(layer);
