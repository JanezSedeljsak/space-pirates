import { Model } from "./Model.js";
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

    static createGlobe(r) {
        const options = {
            vertices: [],
            texcoords: [],
            normals: [],
            indices: []
        }

        let radius = r ?? 10,
            wSeg = 255,
            hSeg = 255,
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
                //const newRadius = radius + noise.perlin3(vertex.x, vertex.y, vertex.z);
                //vertex.z = newRadius * Math.sin( fiStart + u * fiDelta ) * Math.sin( thetaStart + v * thetaDelta );

                options.vertices.push(vertex.x, vertex.y, vertex.z);
                //normal.copy(vertex).normalize();
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

        return options;
    }
}