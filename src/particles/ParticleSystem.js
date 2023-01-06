import { vec3 } from "../../lib/gl-matrix-module.js";
import { Particle } from "./Particle.js";

export class ParticleSystem {
    constructor(length) {
        this.length = length;
        this.generateParticles();
    }

    getRandomVelocity() {
        return [
            Math.random() * 0.2 + 0.1,
            -0.2,
            Math.random() * 0.2 + 0.1
        ];
    }

    generateParticles() {
        this.particles = [...new Array(this.length)].map(_ => this.makeParticle());
    }

    makeParticle() {
        return new Particle([0, -2, 0], this.getRandomVelocity(), 5 + Math.random());
    }

    update(dt) {
        for (let i = 0; i < this.length; i++) {
            this.particles[i].update(dt);
            if (!this.particles[i].isAlive) {
                this.particles[i] = this.makeParticle();
            }
        }
    }
}