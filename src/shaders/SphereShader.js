const vertex = /* glsl */`#version 300 es

#define LIGHT_REDUCE_FACTOR 2.5

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform sampler2D uHeightMap; 
uniform sampler2D uNormalMap; 

uniform vec3 uCameraPosition;
uniform float uDisplacementScale;
uniform int uObjectType;

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
out vec2 vObjectType;

void main() {
    float displacementScale = uDisplacementScale; // -0.08f;
    float displacement = texture(uHeightMap, aTexCoord).r * displacementScale;
    vec4 displacedPosition = aPosition + normalize(texture(uNormalMap, aTexCoord)) * (texture(uHeightMap, aTexCoord).x * displacementScale);
    vTexCoord = aTexCoord;
    gl_Position = uProjection * uViewModel * displacedPosition;

    // lighting
    vec3 surfacePosition = (uViewModel * displacedPosition).xyz;

    float d = distance(surfacePosition, uLight.position) / LIGHT_REDUCE_FACTOR;
    float attenuation = 1.0 / dot(uLight.attenuation, vec3(1, d, d * d));

    vec3 N = normalize(mat3(uViewModel) * normalize(aNormal).xyz);
    vec3 L = normalize(uLight.position - surfacePosition);
    vec3 V = normalize(uCameraPosition - surfacePosition);
    vec3 R = normalize(reflect(-L, N));

    float lambert = max(0.0, dot(L, N)) * uMaterial.diffuse;
    float phong = pow(max(0.0, dot(V, R)), uMaterial.shininess) * uMaterial.specular;

    vDiffuseLight = lambert * attenuation * uLight.color;
    vSpecularLight = phong * attenuation * uLight.color;
    vObjectType = vec2(uObjectType, 1);
}
`;

const fragment = /* glsl */`#version 300 es

precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;
in vec3 vDiffuseLight;
in vec3 vSpecularLight;
in vec2 vObjectType;

out vec4 oColor;

void main() {
    // gamma is lower for asteroids
    float gamma = vObjectType.x == 0.0 ? 4.0 : 1.2;

    vec3 albedo = pow(texture(uTexture, vTexCoord).rgb, vec3(gamma));
    vec3 finalColor = albedo * vDiffuseLight + vSpecularLight;
    oColor = pow(vec4(finalColor, 1), vec4(1.0 / gamma));

    // if of type rock asteroid change color to black and white
    if (vObjectType.x == 2.0) {
        float luminance = (oColor.r + oColor.g + oColor.b)/3.0;
        oColor = vec4(luminance, luminance, luminance, 1.0);
    }

    // if emerald asteroid set color to green
    else if (vObjectType.x == 3.0) {
        float luminance = (oColor.r + oColor.g + oColor.b)/4.0;
        float green = oColor.g;
        oColor = vec4(luminance, luminance + green, luminance, 1.0);
    }
}
`;

export const SphereShader = {
    vertex, fragment
};