import vertexCode from '../shaders/color-triangle/vertex.wgsl?raw';
import fragCode from '../shaders/color-triangle/frag.wgsl?raw';

const initWebGPU = async () => {
  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw Error("Couldn't request WebGPU adapter.");
  }

  const device = await adapter.requestDevice(); // 获取逻辑设备
  const canvas = document.querySelector('canvas');
  const ctx = canvas?.getContext('webgpu');

  if (!ctx) {
    throw new Error("Couldn't get GPUCanvasContext.");
  }

  // 获取颜色格式，默认为 bgra8unorm: 0-255 的 rgba 格式，但数值范围都在 0-1
  const format = navigator.gpu.getPreferredCanvasFormat();

  ctx.configure({
    device,
    format,
  });

  return { adapter, device, ctx, format };
};

const initPipeline = async (device: GPUDevice, format: GPUTextureFormat) => {
  const vertexShader = device.createShaderModule({
    code: vertexCode,
  });
  const fragShader = device.createShaderModule({
    code: fragCode,
  });
  const pipeline = await device.createRenderPipelineAsync({
    vertex: {
      module: vertexShader,
      entryPoint: 'main',
    },
    fragment: {
      module: fragShader,
      entryPoint: 'main',
      targets: [
        {
          format, // 片元输出的是每个像素的颜色，所以需要指定颜色格式，并需与之前配置画布时的配置保持一致
        },
      ],
    },
    primitive: {
      // 顶点信息如何组合
      topology: 'triangle-list',
    },
    // 定义了在管线执行期间，所有 GPU 资源（缓冲区、纹理等）的布局（结构、用途和类型）
    layout: 'auto',
  });

  return { pipeline };
};

// WebGPU 采用 commandEncoder 的机制，提前把命令写入 encoder 中，一次性提交给 Native 运行
const draw = async (
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  ctx: GPUCanvasContext
) => {
  const encoder = device.createCommandEncoder();

  // 类似与 PS 中的图层，允许将多个图层叠加在一起（如动效、绘制阴影等）
  const renderPass = encoder.beginRenderPass({
    // 如何处理相关的颜色信息
    colorAttachments: [
      {
        // 通道输出在哪里显示
        view: ctx.getCurrentTexture().createView(),
        // 在绘制前是否加载当前 view 的内容
        loadOp: 'clear',
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        // 在绘制后对 view 的操作
        storeOp: 'store',
      },
    ],
  });

  renderPass.setPipeline(pipeline);
  // 用多少个线程去运行 vertexShader
  renderPass.draw(3);
  renderPass.end(); // 结束该绘制通道的录制

  const buffer = encoder.finish();

  device.queue.submit([buffer]); // 提交给 Dawn
};

const main = async () => {
  const { device, format, ctx } = await initWebGPU();
  const { pipeline } = await initPipeline(device, format);

  // WebGL 同步绘制，但 WebGPU 提交命令后就不会等待绘制结果，而是将结果直接绘制到屏幕上
  draw(device, pipeline, ctx);
};

main();
