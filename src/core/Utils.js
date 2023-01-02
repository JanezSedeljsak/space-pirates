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

    static scale(value, currentMin, currentMax, newMin, newMax) {
        return ((value - currentMin) / (currentMax - currentMin)) * (newMax - newMin) + newMin;
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
