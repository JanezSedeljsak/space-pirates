import { mat4, quat, vec3 } from '../../lib/gl-matrix-module.js';
import { Utils } from '../core/Utils.js';

export class Node {

    constructor(options = {}) {
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
        const m = this.matrix;
        const degrees = this.rotation.slice(0, 3).map(x => x * 180 / Math.PI);
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

    render({ gl, matrix, uniforms }) {
        gl.bindVertexArray(this.gl.vao);
        gl.uniformMatrix4fv(uniforms.uViewModel, false, matrix);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.gl.texture);
        gl.uniform1i(uniforms.uTexture, 0);
        gl.drawElements(gl.TRIANGLES, this.gl.indices, gl.UNSIGNED_SHORT, 0);
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
