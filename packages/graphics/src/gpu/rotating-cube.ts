import { mat4, vec3 } from 'gl-matrix';
import vertexCode from '../shaders/rotating-cube/vertex.wgsl?raw';
import fragCode from '../shaders/rotating-cube/frag.wgsl?raw';
import cubeVertex from '../utils/cube';

const initWebGPU = async () => {
  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw Error("Couldn't request WebGPU adapter.");
  }

  const device = await adapter.requestDevice(); // 获取逻辑设备
  const canvas = document.querySelector('canvas');
  const ctx = canvas?.getContext('webgpu');

  if (!canvas || !ctx) {
    throw new Error("Couldn't get GPUCanvasContext.");
  }

  const { devicePixelRatio = 1 } = window;
  const width = canvas.clientWidth * devicePixelRatio;
  const height = canvas.clientHeight * devicePixelRatio;

  canvas.width = width;
  canvas.height = height;

  const sizeInfo = {
    width,
    height,
  };
  // 获取颜色格式，默认为 bgra8unorm: 0-255 的 rgba 格式，但数值范围都在 0-1
  const format = navigator.gpu.getPreferredCanvasFormat();

  ctx.configure({
    device,
    format,
  });

  return { adapter, device, ctx, format, sizeInfo };
};

const initPipeline = async (
  device: GPUDevice,
  format: GPUTextureFormat,
  sizeInfo: SizeInfo
) => {
  const { vertex, vertexCount } = cubeVertex;
  const vertexBuffer = device.createBuffer({
    size: vertex.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertex);

  const frag = new Float32Array([1.0, 0.0, 0.0, 1.0]);
  const fragBuffer = device.createBuffer({
    size: frag.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(fragBuffer, 0, frag);

  const mvpMatrixBuffer = device.createBuffer({
    size: 4 * 4 * 4, // 一个 4x4 的矩阵，每项是占 4 个字节的浮点数
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

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
      // 顶点数据的个数和信息，数量与后续的 setVertexBuffer 保持一致
      buffers: [
        {
          // 每个顶点数据以多大进行切分（这里以数组中的 3 项描述一个顶点，每项占 4 个字节）
          arrayStride: 4 * 3,

          // 切分出来的 array 如何对应 shader 里的参数
          // 把一行的 3 个点直接当做一个参数传入 shader
          attributes: [
            {
              shaderLocation: 0, // 传递给 shader 的 @location(0) 这个变量
              offset: 0,
              format: 'float32x3', // 标识参数的长度大小
            },
          ],
        },
      ],
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
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus', // 深度贴图的数据格式 -> 精度
    },
  });

  const depthTexture = device.createTexture({
    size: sizeInfo,
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0), // 对应绑定到 pipeline 的位置布局
    // 指定每个资源的绑定位置，目前一个 group 最多绑定 8 个资源
    entries: [
      {
        binding: 0,
        resource: {
          buffer: fragBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: mvpMatrixBuffer,
        },
      },
    ],
  });

  const vertexInfo = {
    vertex,
    vertexBuffer,
    vertexCount,
  };
  const fragInfo = {
    frag,
    fragBuffer,
    group,
  };

  return { pipeline, vertexInfo, fragInfo, mvpMatrixBuffer, depthTexture };
};

// WebGPU 采用 commandEncoder 的机制，提前把命令写入 encoder 中，一次性提交给 Native 运行
const draw = async (
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  ctx: GPUCanvasContext,
  vertexInfo: VertexInfo,
  fragInfo: FragInfo,
  depthTexture: GPUTexture
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
    depthStencilAttachment: {
      view: depthTexture.createView(), // 存在哪个贴图上
      depthClearValue: 1.0, // 清空的范围
      depthLoadOp: 'clear', // 绘制前是否清空
      depthStoreOp: 'store', // 结果是否保留
    },
  });

  renderPass.setPipeline(pipeline);
  renderPass.setVertexBuffer(0, vertexInfo.vertexBuffer);
  renderPass.setBindGroup(0, fragInfo.group);
  // 用多少个线程去运行 vertexShader
  renderPass.draw(vertexInfo.vertexCount);
  renderPass.end(); // 结束该绘制通道的录制

  const buffer = encoder.finish();

  device.queue.submit([buffer]); // 提交给 Dawn
};

const main = async () => {
  const { device, format, ctx, sizeInfo } = await initWebGPU();
  const { pipeline, vertexInfo, fragInfo, mvpMatrixBuffer, depthTexture } =
    await initPipeline(device, format, sizeInfo);

  const position = { x: 0, y: 0, z: -8 };
  const rotation = { x: 0, y: 0, z: 0 };
  const scale = { x: 1, y: 1, z: 1 };

  const render = () => {
    const modelViewMatrix = mat4.create();

    mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      vec3.fromValues(position.x, position.y, position.z)
    );
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation.x);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation.y);
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation.z);
    mat4.scale(
      modelViewMatrix,
      modelViewMatrix,
      vec3.fromValues(scale.x, scale.y, scale.z)
    );

    const prejectionMatrix = mat4.create();
    const mvpMatrix = mat4.create();

    mat4.perspective(
      prejectionMatrix,
      Math.PI / 4,
      sizeInfo.width / sizeInfo.height,
      0.1,
      100
    );
    mat4.multiply(mvpMatrix, prejectionMatrix, modelViewMatrix);

    device.queue.writeBuffer(mvpMatrixBuffer, 0, mvpMatrix as Float32Array);

    // WebGL 同步绘制，但 WebGPU 提交命令后就不会等待绘制结果，而是将结果直接绘制到屏幕上
    draw(device, pipeline, ctx, vertexInfo, fragInfo, depthTexture);

    rotation.x += 0.01;
    rotation.y += 0.01;

    requestAnimationFrame(render);
  };

  render();

  const { vertex, vertexBuffer } = vertexInfo;
  const { frag, fragBuffer } = fragInfo;

  document
    .querySelector<HTMLInputElement>('input[type="range"]')
    ?.addEventListener('input', function () {
      const { value } = this;

      vertex[0] = +value;
      vertex[3] = -0.5 + +value;
      vertex[6] = 0.5 + +value;

      device.queue.writeBuffer(vertexBuffer, 0, vertex);
      draw(device, pipeline, ctx, vertexInfo, fragInfo, depthTexture);
    });
  document
    .querySelector<HTMLInputElement>('input[type="color"]')
    ?.addEventListener('input', function () {
      const { value: hexColor } = this;
      frag[0] = +`0x${hexColor.slice(1, 3)}` / 255;
      frag[1] = +`0x${hexColor.slice(3, 5)}` / 255;
      frag[2] = +`0x${hexColor.slice(5)}` / 255;

      device.queue.writeBuffer(fragBuffer, 0, frag);
      draw(device, pipeline, ctx, vertexInfo, fragInfo, depthTexture);
    });
};

main();

interface VertexInfo {
  vertex: Float32Array;
  vertexBuffer: GPUBuffer;
  vertexCount: number;
}

interface FragInfo {
  frag: Float32Array;
  fragBuffer: GPUBuffer;
  group: GPUBindGroup;
}

interface SizeInfo {
  width: number;
  height: number;
}
