import { mat4, quat } from "../../lib/gl-matrix-module.js";
import { Node } from "../core/Node.js";

export class ParticleSystemNode extends Node {
  constructor(particleSystem) {
    super({});
    this.particleSystem = particleSystem;
  }

  isParticle() {
    return true;
  }

  getModelViewMatrix(pos, viewMatrix) {
    const modelMatrix = mat4.create()
    mat4.fromTranslation(modelMatrix, pos)
    modelMatrix[0][0] = viewMatrix[0][0];
    modelMatrix[0][1] = viewMatrix[0][1];
    modelMatrix[0][2] = viewMatrix[0][2];
    modelMatrix[1][0] = viewMatrix[1][0];
    modelMatrix[1][1] = viewMatrix[1][1];
    modelMatrix[1][2] = viewMatrix[1][2];
    modelMatrix[2][0] = viewMatrix[2][0];
    modelMatrix[2][1] = viewMatrix[2][1];
    modelMatrix[2][2] = viewMatrix[2][2];

    const modelViewMatrix = mat4.create()
    mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
    return modelViewMatrix;
  }

  render(gl, matrix, camera, programs) {
    const { program, uniforms } = programs.ParticleShader;
    gl.useProgram(program);

    gl.cullFace(gl.FRONT);
    gl.uniformMatrix4fv(uniforms.projection, false, camera.projection);
    gl.uniformMatrix4fv(uniforms.view, false, matrix);
    gl.uniformMatrix4fv(uniforms.parent, false, this.matrix);
    gl.bindVertexArray(this.gl.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.matrixBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.matrixData);

    gl.drawArraysInstanced(
      gl.TRIANGLES,
      0,
      8,
      this.particleSystem.length,
    );
    gl.cullFace(gl.BACK);
  }
}