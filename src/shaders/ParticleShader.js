const vertex = /* glsl */`#version 300 es

in vec2 a_position;
in mat4 matrix;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 parent;

out vec4 v_color;

void main() {
  
  vec3 cameraRight = vec3(view[0][0], view[1][0], view[2][0]) * a_position.x;
  vec3 cameraUp = vec3(view[0][1], view[1][1], view[2][1]) * a_position.y;

  vec4 finalPos = ((projection * view * parent * matrix * vec4(0.0, 0.0, 0.0, 1.0)) + vec4(cameraRight + cameraUp, 1));

  gl_Position = finalPos;
  v_color = matrix[3];
}
`;

const fragment = /* glsl */`#version 300 es

precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

export const ParticleShader = {
    vertex, fragment
};