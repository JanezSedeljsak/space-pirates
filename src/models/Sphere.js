import { Model } from "../core/Model.js";
import { Vector3 } from "../core/Utils.js";

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
        this.translation = [0, verticalOffset, 5];
    }

    async loadHeightMap() {
        const [heightMap, normalMap] = await Promise.all([
            this.loadTexture(`../../assets/images/planets/${this.planetName}_Height.png`),
            this.loadTexture(`../../assets/images/planets/${this.planetName}_Normal.png`)
        ]);
        
        this.heightMap = heightMap;
        this.normalMap = normalMap;
    }

    static createGlobe(r) {
        const options = {
            vertices: [],
            texcoords: [],
            normals: [],
            indices: []
        }

        let radius = r ?? 10,
            wSeg = 256,
            hSeg = 256,
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


                vertex.x = radius * Math.cos(fiRes) * Math.sin(thetaRes) * -1;
                vertex.y = radius * Math.cos(thetaRes);
                vertex.z = radius * Math.sin(fiRes) * Math.sin(thetaRes);

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

        return [options, radius];
    }

    async loadTexture(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const image = await createImageBitmap(blob);
        return image;
    }

    render({ gl, matrix, program, programWorld, uniformsWorld, camera }) {
        gl.useProgram(programWorld);

        gl.uniformMatrix4fv(uniformsWorld.uProjection, false, camera.projection);
        gl.bindVertexArray(this.gl.vao);
        gl.uniformMatrix4fv(uniformsWorld.uViewModel, false, matrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.gl.texture);
        gl.uniform1i(uniformsWorld.uTexture, 0);
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.gl.heightMap);
        gl.uniform1i(uniformsWorld.uHeightMap, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.gl.normalMap);
        gl.uniform1i(uniformsWorld.uNormalMap, 2);

        gl.drawElements(gl.TRIANGLES, this.gl.indices, gl.UNSIGNED_SHORT, 0);
        gl.useProgram(program);
    }
}