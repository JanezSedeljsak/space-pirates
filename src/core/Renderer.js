import { mat4 } from '../../lib/gl-matrix-module.js';
import { WebGL } from '../engine/WebGL.js';
import { shaders } from '../shaders.js';
import { Sphere } from '../models/Sphere.js';
import { GLTFNode } from '../gltf/GLTFNode.js';
import { GLTFRenderer } from '../gltf/GLTFRenderer.js';
import { Utils } from './Utils.js';

export class Renderer extends GLTFRenderer {

    constructor(gl) {
        super(gl);
        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        this.programs = WebGL.buildPrograms(gl, shaders);
    }

    async prepare(scene) {
        scene.traverse(async node => {
            if (node instanceof GLTFNode && (!node.parent || !(node.parent instanceof GLTFNode))) {
                this.prepareNode(node);
            }

            if (!(node instanceof GLTFNode)) {
                node.gl = {};
                if (node.mesh) {
                    Object.assign(node.gl, this.createModel(node.mesh));
                }
                if (node.image) {
                    node.gl.texture = this.createTexture(node.image);
                }
                if (node instanceof Sphere) {
                    await node.loadHeightMap();
                    node.gl.heightMap = this.createTexture(node.heightMap);
                    node.gl.normalMap = this.createTexture(node.normalMap);
                }
            }
        });
    }

    createTexture(texture) {
        const gl = this.gl;
        return WebGL.createTexture(gl, {
            image: texture,
            min: gl.NEAREST,
            mag: gl.NEAREST
        });
    }

    getViewProjectionMatrix(camera) {
        const vpMatrix = camera.matrix;
        mat4.invert(vpMatrix, vpMatrix);
        mat4.mul(vpMatrix, camera.projection, vpMatrix);
        return vpMatrix;
    }

    createModel(model) {
        const gl = this.gl;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoords), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        const indices = model.indices.length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

        return { vao, indices };
    }

    render(scene, camera) {
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.clearColor(0.1, 0.2, 0.35, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const { program, uniforms } = this.programs.simple;
        const { program: programWorld, uniforms: uniformsWorld } = this.programs.worldshader;

        this.renderDEFAULT({ gl, scene, program, uniforms, programWorld, uniformsWorld, camera });
        this.renderGLTF({ gl, scene, camera, program });
    }

    renderGLTF({ gl, scene, camera, program }) {
        gl.useProgram(program);
        const mvpMatrix = this.getViewProjectionMatrix(camera);

        scene.traverse(node => {
            // render root gltf nodes
            if (node instanceof GLTFNode && (!node.parent || !(node.parent instanceof GLTFNode))) {
                this.renderNode(node, mvpMatrix);
            }
        });
    }

    renderDEFAULT({ gl, scene, program, uniforms, programWorld, uniformsWorld, camera }) {
        gl.useProgram(program);

        const matrix = mat4.create();
        const matrixStack = [];

        const viewMatrix = camera.getGlobalTransform();
        mat4.invert(viewMatrix, viewMatrix);
        mat4.copy(matrix, viewMatrix);
        
        scene.traverse(
            node => {
                if (!(node instanceof GLTFNode)) {
                    matrixStack.push(mat4.clone(matrix));
                    mat4.mul(matrix, matrix, node.matrix);

                    if (node?.gl?.vao) {
                        node.render({ gl, matrix, camera, program, uniforms, programWorld, uniformsWorld });
                    }
                }
            },
            node => {
                if (!(node instanceof GLTFNode)) {
                    mat4.copy(matrix, matrixStack.pop());
                }
            }
        );
    }
}
