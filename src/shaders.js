const vertex = `#version 300 es
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

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord);
}
`;

const vertexWorld = `#version 300 es
layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform sampler2D uHeightMap; 
uniform sampler2D uNormalMap; 

uniform mat4 uViewModel;
uniform mat4 uProjection;

out vec2 vTexCoord;

void main() {
    float displacementScale = -0.06;
    float displacement = texture(uHeightMap, aTexCoord).r * displacementScale;
    vec4 displacedPosition = aPosition + normalize(texture(uNormalMap, aTexCoord)) * (texture(uHeightMap, aTexCoord).x * displacementScale);
    vTexCoord = aTexCoord;
    gl_Position = uProjection * uViewModel * displacedPosition;
}
`;

const fragmentWorld = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord);
    oColor.a = 1.0;
}
`;

export const shaders = {
    simple: { vertex, fragment },
    worldshader: { vertex: vertexWorld, fragment: fragmentWorld }
};
