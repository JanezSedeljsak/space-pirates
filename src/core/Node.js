import { vec3, mat4, quat } from '../../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';

export class Node {

    constructor(options = {}) {
        this.isGLTF = options?.gltf ?? false;
        Utils.init(this, Node.defaults, options);

        this.mesh = options.mesh ?? null;
        this.matrix = mat4.create();
        this.updateMatrix();

        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }

        this.parent = null;
    }

    updateMatrix() {
        if (this.isGLTF) {
            mat4.fromRotationTranslationScale(
                this.matrix,
                this.rotation,
                this.translation,
                this.scale
            );
            return;
        }

        const m = this.matrix;
        const degrees = this.rotation.map(x => x * 180 / Math.PI);
        const q = quat.fromEuler(quat.create(), ...degrees);
        const v = vec3.clone(this.translation);
        const s = vec3.clone(this.scale);
        mat4.fromRotationTranslationScale(m, q, v, s);
    }

    getGlobalTransform() {
        if (!this.parent) {
            return mat4.clone(this.matrix);
        } else {
            const matrix = this.parent.getGlobalTransform();
            return mat4.mul(matrix, matrix, this.matrix);
        }
    }

    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }

    traverse(before, after) {
        if (before) {
            before(this);
        }
        for (const child of this.children) {
            child.traverse(before, after);
        }
        if (after) {
            after(this);
        }
    }

    render({ gl, matrix, program, uniforms, programWorld, uniformsWorld, camera, glObjects, defaultSampler, defaultTexture }) {
        if (this.isGLTF) {
            gl.uniformMatrix4fv(uniforms.uModelViewProjection, false, matrix);

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
                    child.render({ gl, matrix, program, uniforms, programWorld, uniformsWorld, camera, glObjects, defaultSampler, defaultTexture });
                }
            }

        } else {
            gl.bindVertexArray(this.gl.vao);
            gl.uniformMatrix4fv(uniforms.uViewModel, false, matrix);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.gl.texture);
            gl.uniform1i(uniforms.uTexture, 0);
            gl.drawElements(gl.TRIANGLES, this.gl.indices, gl.UNSIGNED_SHORT, 0);
        }
    }

}

Node.defaults = {
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    aabb: {
        min: [0, 0, 0],
        max: [0, 0, 0],
    },
};
