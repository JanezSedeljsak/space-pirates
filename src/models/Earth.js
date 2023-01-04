import { Sphere } from './Sphere.js';
import { quat, mat4, vec3 } from '../../lib/gl-matrix-module.js';
import { SPHERE_TYPE_ENUM } from '../config.js';

export class Earth extends Sphere {

    constructor(mesh, texture, spec, radius) {
        super(mesh, texture, spec, radius, null);
        this.rotationSpeed = 0.05;
        this.type = SPHERE_TYPE_ENUM.EARTH;
        this.setTranslation([100, 350, -1650]);
    }

    isEarth() {
        return true;
    }

    isSphere() {
        return false;
    }

    setTranslation(tVector) {
        this.translation = tVector;
        this.updateMatrix();
    }

    update(dt) {
        this.rotation[1] += dt * this.rotationSpeed;
        this.updateMatrix();
    }

    getObjectType() {
        return this.type;
    }

    updateMatrix() {
        const m = this.matrix;
        const degrees = this.rotation.slice(0, 3).map(x => x * 180 / Math.PI);
        const q = quat.fromEuler(quat.create(), ...degrees);
        const v = vec3.clone(this.translation);
        const s = vec3.clone(this.scale);
        mat4.fromRotationTranslationScale(m, q, v, s);
    }

    render(gl, matrix, camera, programs) {
        const { program, uniforms } = programs.EarthShader;
        gl.useProgram(program);

        gl.uniformMatrix4fv(uniforms.uProjection, false, camera.projection);
        gl.bindVertexArray(this.gl.vao);
        gl.uniformMatrix4fv(uniforms.uViewModel, false, matrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.gl.texture);
        gl.uniform1i(uniforms.uTexture, 0);

        gl.drawElements(gl.TRIANGLES, this.gl.indices, gl.UNSIGNED_SHORT, 0);
    }

}