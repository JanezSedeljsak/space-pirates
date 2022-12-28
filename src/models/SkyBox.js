import { Model } from "../core/Model.js";

export class SkyBox extends Model {

    render({ gl, matrix, uniforms, program }) {
        gl.useProgram(program);
        gl.cullFace(gl.FRONT);
        gl.bindVertexArray(this.gl.vao);
        gl.uniformMatrix4fv(uniforms.uViewModel, false, matrix);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.gl.texture);
        gl.uniform1i(uniforms.uTexture, 0);
        gl.drawElements(gl.TRIANGLES, this.gl.indices, gl.UNSIGNED_SHORT, 0);
        gl.cullFace(gl.BACK);
    }
}