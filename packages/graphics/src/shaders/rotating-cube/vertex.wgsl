@group(0) @binding(1) var<uniform> mvpMatrix : mat4x4<f32>;

struct VertexOutput
{
    @builtin(position) position_ : vec4<f32>,
    @location(0) fragPosition : vec4<f32>
}

@vertex
fn main(@location(0) position : vec3<f32>) -> VertexOutput {
    var vertexOutput: VertexOutput;
    var coordinate: vec4<f32> = vec4<f32>(position, 1.0);

    vertexOutput.position_ = mvpMatrix * coordinate;
    vertexOutput.fragPosition = 0.5 * (coordinate + vec4<f32>(1.0, 1.0, 1.0, 1.0));

    return vertexOutput;
}
