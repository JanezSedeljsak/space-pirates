export class Utils {

    static init(object, defaults, options) {
        const filtered = Utils.clone(options || {});
        const defaulted = Utils.clone(defaults || {});
        for (const key in filtered) {
            if (!defaulted.hasOwnProperty(key)) {
                delete filtered[key];
            }
        }
        Object.assign(object, defaulted, filtered);
    }

    static clone(object) {
        return JSON.parse(JSON.stringify(object));
    }

    static distance(obj1, obj2) {
        const xDiff = obj2[0] - obj1[0];
        const yDiff = obj2[1] - obj1[1];
        const zDiff = obj2[2] - obj1[2];
        return Math.sqrt(xDiff ** 2 + yDiff ** 2 + zDiff ** 2);
    }
}

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

    static validateUniq(pos, positions, dist) {
        for (const p of positions) {
            if (Utils.distance(p, pos) < dist) {
                return false;
            }
        }

        return true;
    }
    
    static createUniq(positions, offset, dist) {
        while (true) {
            const pos = PointGenerator.createRandom(offset);
            if (PointGenerator.validateUniq(pos, positions, dist)) {
                return pos;
            }
        }
    }

    static multipleUniq(amount, offset, dist) {
        const positions = [];
        for (let i = 0; i < amount; i++) {
            const uniq = PointGenerator.createUniq(positions, offset, dist);
            positions.push(uniq);
        }

        return positions;
    }
}

export class Vector3 {
    static ZERO = new Vector3(0, 0, 0);
    static ONE = new Vector3(1, 1, 1);

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other) {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    divide(other) {
        return new Vector3(this.x / other.x, this.y / other.y, this.z / other.z);
    }

    mulScalar(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    copy() {
        return new Vector3(this.x, this.y, this.z)
    }

    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }

    normalize() {
        const len = this.length();
        return new Vector3(this.x / len, this.y / len, this.z / len);
    }
}
