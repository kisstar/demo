# VS WebGL

WebGPU is the successor to WebGL

WebGL 是一个 JavaScript API，可在任何兼容的 Web 浏览器中渲染高性能的交互式 3D 和 2D 图形。

- 多平台运行
- 内嵌在浏览器中
- Web 版本的 OpenGL

缺陷：

- 新一代的原生 GPU API 并没有任何计划对 OpenGL（以及 WebGL）进行更多更新
- WebGL 完全基于绘制图形并将它们渲染到画布的用例。它并不能很好地处理通用 GPU（GPGPU）的计算

WebGPU 则是针对 Web 提供的新一代图形学 API。

- W3C - GPU Working Group 统一标准，全平台支持
- 接入现代图形学 API - D3D/Vulkan/Metal
- 更快、更灵活、更现代
