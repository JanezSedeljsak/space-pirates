import { GLTFNode } from "../gltf/GLTFNode.js";
import { PLANE_ROTATION_VECTOR } from "../config.js";
import { QuaternionRotation } from "../core/QuaternionRotation.js";

export class Plane extends GLTFNode {

    constructor(options) {
        super(options);

        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        this.rotation = PLANE_ROTATION_VECTOR;
        this.updateMatrix();

        this.sphere = null;
        this.keys = {};

        this.aabb = {
            min: [-5, -500, 0],
            max: [5, 0, 0],
        }
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
        const speed = dt * 0.25;
        let forward = 0, side = 0;

        if (this.keys['KeyW']) {
            forward = -speed;
        }

        if (this.keys['KeyA']) {
            this.rotation[2] = 0.2;
            side = -speed;
        } else if (this.keys['KeyD']) {
            this.rotation[2] = -0.2;
            side = speed;
        } else {
            this.rotation[2] = .0;
        }

        this.sphere.rotation = QuaternionRotation.xz(this.sphere.rotation, forward, side);
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