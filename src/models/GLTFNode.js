import { Node } from './Node.js';

export class GLTFNode extends Node {

    constructor(options = {}) {
        const props = { ...options };
        super(options);
        this._props = props;
    }

    clone() {
        return new GLTFNode(this._props);
    }

    render({ gl, program, uniforms, programWorld, uniformsWorld, camera, glObjects, defaultSampler, defaultTexture, mvpMatrix }) {
        gl.uniformMatrix4fv(uniforms.uModelViewProjection, false, mvpMatrix);

        for (const primitive of this.mesh.primitives) {
            const vao = glObjects.get(primitive);
            gl.bindVertexArray(vao);

            const material = primitive.material;
            gl.uniform4fv(uniforms.uBaseColorFactor, material.baseColorFactor);

            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(uniforms.uBaseColorTexture, 0);

            const texture = material.baseColorTexture;
            const glTexture = texture
                ? glObjects.get(texture.image)
                : defaultTexture;
            const glSampler = texture
                ? glObjects.get(texture.sampler)
                : defaultSampler;

            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.bindSampler(0, glSampler);

            if (primitive.indices) {
                const mode = primitive.mode;
                const count = primitive.indices.count;
                const type = primitive.indices.componentType;
                gl.drawElements(mode, count, type, 0);
            } else {
                const mode = primitive.mode;
                const count = primitive.attributes.POSITION.count;
                gl.drawArrays(mode, 0, count);
            }
        }

        if (this?.children) {
            for (const child of this.children) {
                child.render({ gl, mvpMatrix, program, uniforms, programWorld, uniformsWorld, camera, glObjects, defaultSampler, defaultTexture });
            }
        }
    }
}
