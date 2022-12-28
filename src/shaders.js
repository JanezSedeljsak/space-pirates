const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 3) in vec2 aTexCoord;

uniform mat4 uModelViewProjection;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uModelViewProjection * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;
precision mediump sampler2D;

uniform sampler2D uBaseColorTexture;
uniform vec4 uBaseColorFactor;

in vec2 vTexCoord;

out vec4 oColor;

void main() {
    vec4 baseColor = texture(uBaseColorTexture, vTexCoord);
    oColor = uBaseColorFactor * baseColor;
}
`;

const defaultVertex = `#version 300 es

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

const defaultFragment = `#version 300 es

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
    oColor = texture(uTexture, vec2(radnomValue, 1.0));
    // oColor = texture(uTexture, vTexCoord);
}
`;

const vertexWorld = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform sampler2D uHeightMap; 
uniform sampler2D uNormalMap; 

uniform vec3 uCameraPosition;

struct Light {
    vec3 position;
    vec3 attenuation;
    vec3 color;
};

struct Material {
    float diffuse;
    float specular;
    float shininess;
};

uniform Light uLight;
uniform Material uMaterial;

uniform mat4 uViewModel;
uniform mat4 uProjection;

out vec2 vTexCoord;
out vec3 vDiffuseLight;
out vec3 vSpecularLight;

void main() {
    float displacementScale = -0.07;
    float displacement = texture(uHeightMap, aTexCoord).r * displacementScale;
    vec4 displacedPosition = aPosition + normalize(texture(uNormalMap, aTexCoord)) * (texture(uHeightMap, aTexCoord).x * displacementScale);
    vTexCoord = aTexCoord;
    gl_Position = uProjection * uViewModel * displacedPosition;

    // lighting
    vec3 surfacePosition = (uViewModel * displacedPosition).xyz;

    float d = distance(surfacePosition, uLight.position);
    float attenuation = 1.0 / dot(uLight.attenuation, vec3(1, d, d * d));

    vec3 N = normalize(mat3(uViewModel) * normalize(texture(uNormalMap, aTexCoord)).xyz);
    vec3 L = normalize(uLight.position - surfacePosition);
    vec3 V = normalize(uCameraPosition - surfacePosition);
    vec3 R = normalize(reflect(-L, N));

    float lambert = max(0.0, dot(L, N)) * uMaterial.diffuse;
    float phong = pow(max(0.0, dot(V, R)), uMaterial.shininess) * uMaterial.specular;

    vDiffuseLight = lambert * attenuation * uLight.color;
    vSpecularLight = phong * attenuation * uLight.color;
}
`;

const fragmentWorld = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;
in vec3 vDiffuseLight;
in vec3 vSpecularLight;

out vec4 oColor;

void main() {
    const float gamma = 2.2;
    vec3 albedo = pow(texture(uTexture, vTexCoord).rgb, vec3(gamma));
    vec3 finalColor = albedo * vDiffuseLight + vSpecularLight;
    oColor = pow(vec4(finalColor, 1), vec4(1.0 / gamma));
}
`;

export const shaders = {
    simple: { vertex, fragment },
    worldshader: { vertex: vertexWorld, fragment: fragmentWorld },
    defaultShader: { vertex: defaultVertex, fragment: defaultFragment }
};
