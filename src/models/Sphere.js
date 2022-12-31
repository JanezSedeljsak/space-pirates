import { Model } from "../core/Model.js";
import { Vector3 } from "../core/Utils.js";
import { vec3, mat4 } from "../../lib/gl-matrix-module.js";
import { Node } from "../core/Node.js";
import { GUI } from '../../../lib/dat.gui.module.js';
import { IS_DEBUG } from "../config.js";

export class Sphere extends Model {

    // currently unused
    // static convertPoint(point) {
    //     let x2 = point[0]**2
    //     let y2 = point[1]**2
    //     let z2 = point[2]**2
    //     const x = point[0] * Math.sqrt(1 - (y2 + z2) / 2 + (y2 * z2) / 3);
    //     const y = point[1] * Math.sqrt(1 - (z2 + x2) / 2 + (z2 * x2) / 3);
    //     const z = point[2] * Math.sqrt(1 - (x2 + y2) / 2 + (x2 * y2) / 3) * 0.2;
    //     return [x, y, z]
    // }

    constructor(mesh, texture, spec, radius, planetName) {
        super(mesh, texture, spec);
        this.radius = radius;
        this.planetName = planetName;

        const verticalOffset = -(radius + Math.sqrt(radius) / 1.2);
        this.verticalOffset = verticalOffset;
        this.translation = [0, verticalOffset, 5];

        this.light = new Node();
        this.light.translation = [0, 0, 0];
        this.light.color = [255, 255, 255];
        this.light.intensity = 10;
        this.light.attenuation = [0.001, 0, 0.3];

        this.light.updateMatrix();
        this.material = {};
        this.material.diffuse = 1;
        this.material.specular = 1;
        this.material.shininess = 5;

        if (IS_DEBUG) {
            this._debugGUI();
        }
    }

    isSphere() {
        return true;
    }

    async loadHeightMap() {
        const [heightMap, normalMap] = await Promise.all([
            this.loadTexture(`../../assets/images/planets/${this.planetName}_Height.avif`),
            this.loadTexture(`../../assets/images/planets/${this.planetName}_Normal.avif`)
        ]);

        this.heightMap = heightMap;
        this.normalMap = normalMap;
    }

    _debugGUI() {
        const gui = new GUI();

        const light = gui.addFolder('Light');
        light.open();
        light.add(this.light, 'intensity', 0, 5);
        light.addColor(this.light, 'color');

        const lightPosition = light.addFolder('Position');
        lightPosition.open();
        lightPosition.add(this.light.translation, 0, -50, 50).name('x');
        lightPosition.add(this.light.translation, 1, -50, 50).name('y');
        lightPosition.add(this.light.translation, 2, -50, 50).name('z');

        const lightAttenuation = light.addFolder('Attenuation');
        lightAttenuation.open();
        lightAttenuation.add(this.light.attenuation, 0, 0, 5).name('constant');
        lightAttenuation.add(this.light.attenuation, 1, 0, 2).name('linear');
        lightAttenuation.add(this.light.attenuation, 2, 0, 1).name('quadratic');

        const material = gui.addFolder('Material');
        material.open();
        material.add(this.material, 'diffuse', 0, 1);
        material.add(this.material, 'specular', 0, 1);
        material.add(this.material, 'shininess', 1, 200);
    }

    static createRandomPoint(radius) {
        // generate points between (-1, 1)
        let x = (Math.random() * 2) - 1;
        let y = (Math.random() * 2) - 1;
        let z = (Math.random() * 2) - 1;
      
        // normalize the point to make it a point on the surface of the sphere
        const normalizationFactor = radius / Math.sqrt(x ** 2 + y ** 2 + z ** 2);
        x *= normalizationFactor;
        y *= normalizationFactor;
        z *= normalizationFactor;
      
        return [x, y, z];
    }

    static createGlobe({ radius, segments }) {
        const options = {
            vertices: [],
            texcoords: [],
            normals: [],
            indices: []
        }

        let sphereRadius = radius ?? 10,
            wSeg = segments ?? 32,
            hSeg = segments ?? 32,
            fiStart = 0,
            fiDelta = Math.PI * 2,
            thetaStart = 0,
            thetaDelta = Math.PI,
            index = 0;

        const grid = [];
        const thetaEnd = Math.min(thetaStart + thetaDelta, Math.PI);
        const vertex = Vector3.ZERO;
        const normal = Vector3.ZERO;

        // create vertecies from height segments
        for (let y = 0; y <= hSeg; y++) {
            const row = [];
            const v = y / hSeg;

            let uOffset = 0;
            if (y == hSeg && thetaEnd == Math.PI) {
                uOffset = 0.5 / wSeg;
            } else if (y == 0 && thetaStart == 0) {
                uOffset = - 0.5 / wSeg;
            }

            // for each row create columns from width segments
            for (let x = 0; x <= wSeg; x++) {
                const u = x / wSeg;
                const fiRes = fiStart + u * fiDelta
                const thetaRes = thetaStart + v * thetaDelta


                vertex.x = sphereRadius * Math.cos(fiRes) * Math.sin(thetaRes) * -1;
                vertex.y = sphereRadius * Math.cos(thetaRes);
                vertex.z = sphereRadius * Math.sin(fiRes) * Math.sin(thetaRes);

                // wobbly earth with perlin noise
                //const newRadius = radius + noise.perlin3(vertex.x, vertex.y, vertex.z);;
                //vertex.z = newRadius * Math.sin( fiStart + u * fiDelta ) * Math.sin( thetaStart + v * thetaDelta );

                options.vertices.push(vertex.x, vertex.y, vertex.z);
                options.normals.push(normal.x, normal.y, normal.z);
                options.texcoords.push(u + uOffset, 1 - v);
                row.push(index++);
            }

            grid.push(row);
        }

        // generate indecies
        for (let y = 0; y < hSeg; y++) {
            for (let x = 0; x < wSeg; x++) {
                const a = grid[y][x + 1];
                const b = grid[y][x];
                const c = grid[y + 1][x];
                const d = grid[y + 1][x + 1];

                if (y !== 0 || thetaStart > 0) options.indices.push(a, b, d);
                if (y !== hSeg - 1 || thetaEnd < Math.PI) options.indices.push(b, c, d);
            }
        }

        return [options, sphereRadius];
    }

    async loadTexture(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const image = await createImageBitmap(blob);
        return image;
    }

    getDisplacementScale() {
        return -0.08;
    }

    render(gl, matrix, camera, programs) {
        const light = this.light;

        const { program, uniforms } = programs.SphereShader;
        gl.useProgram(program);

        gl.uniformMatrix4fv(uniforms.uProjection, false, camera.projection);
        gl.bindVertexArray(this.gl.vao);
        gl.uniformMatrix4fv(uniforms.uViewModel, false, matrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.gl.texture);
        gl.uniform1i(uniforms.uTexture, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.gl.heightMap);
        gl.uniform1i(uniforms.uHeightMap, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.gl.normalMap);
        gl.uniform1i(uniforms.uNormalMap, 2);

        const cameraPos = mat4.getTranslation(vec3.create(), camera.getGlobalTransform());
        gl.uniform3fv(uniforms.uCameraPosition, cameraPos);

        gl.uniform1f(uniforms.uDisplacementScale, this.getDisplacementScale());

        const lightParam = vec3.scale(vec3.create(), light.color, light.intensity / 255);
        gl.uniform3fv(uniforms.uLight.color, lightParam);

        if (IS_DEBUG) {
            this.light.updateMatrix();
        }

        const lightPosition = mat4.getTranslation(vec3.create(), this.light.getGlobalTransform());
        gl.uniform3fv(uniforms.uLight.position, lightPosition);
        gl.uniform3fv(uniforms.uLight.attenuation, light.attenuation);

        gl.uniform1f(uniforms.uMaterial.diffuse, this.material.diffuse);
        gl.uniform1f(uniforms.uMaterial.specular, this.material.specular);
        gl.uniform1f(uniforms.uMaterial.shininess, this.material.shininess);

        gl.drawElements(gl.TRIANGLES, this.gl.indices, gl.UNSIGNED_SHORT, 0);
    }
}