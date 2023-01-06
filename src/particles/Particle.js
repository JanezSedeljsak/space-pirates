import { vec3 } from "../../lib/gl-matrix-module.js";

export class Particle {
    constructor(position, velocity, timeLeft) {
        this.position = position;
        this.velocity = velocity;
        this.isAlive = true;
        this.timeLeft = timeLeft;
    }

    update(dt) {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.isAlive = false;
            return;
        }

        vec3.add(this.position, this.position, vec3.multiplyScalar(dt, this.velocity));
    }
}