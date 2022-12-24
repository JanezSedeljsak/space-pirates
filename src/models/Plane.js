// import { vec3 } from "../lib/gl-matrix-module.js";
import { Model } from "./Model.js";

export class Plane extends Model {

    constructor(mesh, image, options) {
        super(mesh, image, options);

        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        this.sphere = null;
        this.directionVector = [0, 0, 0];
        this.keys = {};
    }

    enable() {
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (const key in this.keys) {
            this.keys[key] = false;
        }
    }

    update(dt) {
        if (this.keys['KeyW']) {
            this.sphere.rotation[0] += dt * .05;
        }

        if (this.keys['KeyA']) {
            this.rotation = [0, 0.1, 0.5];
            this.sphere.rotation[1] -= dt * .05;
            this.sphere.rotation[2] -= dt * .03;
        } else if (this.keys['KeyD']) {
            this.rotation = [0, -0.1, -0.5];
            this.sphere.rotation[1] += dt * .05;
            this.sphere.rotation[2] += dt * .03;
        } else {
            this.rotation = [0, 0, 0];
        }

        this.sphere.updateMatrix();
        this.updateMatrix();
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }
}