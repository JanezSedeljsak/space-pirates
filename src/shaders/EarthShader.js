const vertex = /* glsl */`#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform mat4 uViewModel;
uniform mat4 uProjection;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uProjection * uViewModel * aPosition;
}
`;

const fragment = /* glsl */`#version 300 es

precision mediump float;
uniform mediump sampler2D uTexture;

const int KERNEL_SIZE = 3;
const float MIX_AMOUNT = 0.4f;
const vec4 DARK_COLOR = vec4(0.5, 0.5, 0.5, 1.0);


in vec2 vTexCoord;
out vec4 oColor;

vec4 texelSize;
vec4 horizontalBlur;
vec4 offset;
vec4 originalColor;

void main() {
    texelSize = vec4(1.0 / vec2(textureSize(uTexture, 0)), 0.0, 0.0);
    vec4 sum = vec4(0.0);
    for (int x = -KERNEL_SIZE; x <= KERNEL_SIZE; ++x) {
        offset = vec4(x, 0.0, 0.0, 0.0) * texelSize;
        sum += texture(uTexture, vTexCoord + offset.xy);
    }
    horizontalBlur = sum / float(KERNEL_SIZE * 2 + 1);
    sum = vec4(0.0);
    for (int y = -KERNEL_SIZE; y <= KERNEL_SIZE; ++y) {
        offset = vec4(0.0, y, 0.0, 0.0) * texelSize;
        sum += (horizontalBlur + offset);
    }

    originalColor = sum / float(KERNEL_SIZE * 2 + 1);
    oColor = mix(originalColor, DARK_COLOR, MIX_AMOUNT);
    oColor = vec4(vec3(oColor.xyz * 0.7), 1.0);
}
`;

export const EarthShader = {
    vertex, fragment
}