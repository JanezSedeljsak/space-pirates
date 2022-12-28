const vertex = /* glsl */`#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform mat4 uViewModel;
uniform mat4 uProjection;

out vec2 vTexCoord;
out vec4 vPosition;

void main() {
    vPosition = uProjection * uViewModel * aPosition;
    vTexCoord = aTexCoord;
    gl_Position = vPosition;
}
`;

const fragment = /* glsl */`#version 300 es

precision mediump float;
uniform mediump sampler2D uTexture;

in vec2 vTexCoord;
in vec4 vPosition;

out vec4 oColor;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 directionToTexcoord(vec3 v) {
    const float PI = 3.14159265358979;
    return vec2((atan(v.z, v.x) / PI) * 0.5 + 0.5, acos(v.y) / PI);
}

void main() {
    float radnomValue = rand(directionToTexcoord(normalize(vPosition.xyz)));
    oColor = texture(uTexture, vec2(radnomValue, 2.5f));
    // oColor = texture(uTexture, vTexCoord);
}
`;

export const SkyBoxShader = {
    vertex, fragment
};