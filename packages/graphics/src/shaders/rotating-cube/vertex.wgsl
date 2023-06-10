@group(0) @binding(1) var<uniform> mvpMatrix : mat4x4<f32>;

struct VertexOutput
{
    @builtin(position) position : vec4<f32>,
    @location(0) fragPosition : vec4<f32>
}

@vertex
fn main(@location(0) position : vec4<f32>) -> VertexOutput {
    var vertexOutput: VertexOutput;

    vertexOutput.position = mvpMatrix * position;
    vertexOutput.fragPosition = (position + vec4<f32>(1.0, 1.0, 1.0, 1.0)) / 2;

    return vertexOutput;
}
