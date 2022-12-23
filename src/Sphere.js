import { Model } from "./Model.js";
import { Vector3 } from "./Utils.js";

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

    static createGlobe() {
        const options = {
            vertices: [],
            texcoords: [],
            normals: [],
            indices: []
        }

        let radius = 50, // this should be the some as y offset in scene.json
            widthSegments = 128,
            heightSegments = 128,
            phiStart = 0,
            phiLength = Math.PI * 2,
            thetaStart = 0,
            thetaLength = Math.PI,
            index = 0;

        const grid = [];
        const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);
        const vertex = Vector3.ZERO;
        const normal = Vector3.ZERO;

        for (let iy = 0; iy <= heightSegments; iy++) {
            const verticesRow = [];
            const v = iy / heightSegments;

            let uOffset = 0;

            if (iy == 0 && thetaStart == 0) {
                uOffset = 0.5 / widthSegments;
            } else if (iy == heightSegments && thetaEnd == Math.PI) {
                uOffset = - 0.5 / widthSegments;
            }

            for (let ix = 0; ix <= widthSegments; ix++) {
                const u = ix / widthSegments;
                vertex.x = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
                vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
                vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

                // wobbly earth with perlin noise
                //const newRadius = radius + noise.perlin3(vertex.x, vertex.y, vertex.z);
                //vertex.z = newRadius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

                options.vertices.push(vertex.x, vertex.y, vertex.z);
                normal.copy(vertex).normalize();
                options.normals.push(normal.x, normal.y, normal.z);
                options.texcoords.push(u + uOffset, 1 - v);
                verticesRow.push(index++);

            }

            grid.push(verticesRow);

        }

        for (let iy = 0; iy < heightSegments; iy++) {
            for (let ix = 0; ix < widthSegments; ix++) {
                const a = grid[iy][ix + 1];
                const b = grid[iy][ix];
                const c = grid[iy + 1][ix];
                const d = grid[iy + 1][ix + 1];

                if (iy !== 0 || thetaStart > 0) options.indices.push(a, b, d);
                if (iy !== heightSegments - 1 || thetaEnd < Math.PI) options.indices.push(b, c, d);

            }
        }

        return options;
    }
}