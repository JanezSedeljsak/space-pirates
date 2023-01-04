const vertex = /* glsl */`#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec3 aNormal;
layout (location = 3) in vec2 aTexCoord;

uniform mat4 uModelViewProjection;

out vec2 vTexCoord;
out vec3 vNormal;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uModelViewProjection * aPosition;
    vNormal = aNormal;
}
`;

const fragment = /* glsl */`#version 300 es

precision mediump float;
precision mediump sampler2D;

uniform sampler2D uBaseColorTexture;
uniform vec4 uBaseColorFactor;

in vec2 vTexCoord;
in vec3 vNormal;

out vec4 oColor;

void main() {
    vec4 baseColor = texture(uBaseColorTexture, vTexCoord);
    // oColor = uBaseColorFactor * baseColor;
    oColor = baseColor * uBaseColorFactor + vec4((vNormal * 0.05), 1);
    if ((oColor.r + oColor.g + oColor.b) > 0.3) {
        oColor = vec4(vec3(oColor.xyz * 0.6), 1);
        oColor = vec4(oColor.r + 0.2, oColor.g + 0.1, oColor.b, 1);
    }
}
`;

export const GLTFShader = {
    vertex, fragment
};