import { Utils } from "./Utils.js";
import { CENTER_OFFSET } from "../config.js";

export class PointGenerator {

    static createRandom(radius) {
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

    static validate(pos, positions, dist, center) {
        // check if near center
        if (Utils.distance(center, pos) < CENTER_OFFSET) {
            return false;
        }

        // check if any other asteroid could colide
        for (const p of positions) {
            if (Utils.distance(p, pos) < dist) {
                return false;
            }
        }

        return true;
    }
    
    static createUniq(positions, offset, dist, center) {
        while (true) {
            const pos = PointGenerator.createRandom(offset);
            if (PointGenerator.validate(pos, positions, dist, center)) {
                return pos;
            }
        }
    }

    static multipleUniq({ amount, offset, dist, center }) {
        const positions = [];
        for (let i = 0; i < amount; i++) {
            const uniq = PointGenerator.createUniq(positions, offset, dist, center);
            positions.push(uniq);
        }

        return positions;
    }
}