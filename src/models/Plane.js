import { GLTFNode } from "../gltf/GLTFNode.js";
import { PLANE_ROTATION_VECTOR } from "../config.js";

export class Plane extends GLTFNode {

    constructor(options) {
        super(options);

        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        this.rotation = PLANE_ROTATION_VECTOR;
        this.updateMatrix();

        this.sphere = null;
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
        const speed = 0.2;
        if (this.keys['KeyW']) {
            this.sphere.rotation[0] += dt * speed;
        }

        if (this.keys['KeyA']) {
            //this.translation = [1, 1, 1];
            this.rotation[2] = 0.2;
            this.sphere.rotation[2] -= dt * speed;
        } else if (this.keys['KeyD']) {
            this.rotation[2] = -0.2;
            this.sphere.rotation[2] += dt * speed;
        } else {
            this.rotation[2] = .0;
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