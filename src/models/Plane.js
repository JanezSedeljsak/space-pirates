import { GLTFNode } from "../gltf/GLTFNode.js";
import { PLANE_ROTATION_VECTOR } from "../config.js";
import { QuaternionRotation } from "../core/QuaternionRotation.js";
import { Utils } from "../core/Utils.js";

export class Plane extends GLTFNode {

    constructor(options) {
        super(options);
        Utils.init(this, Plane.defaults, options);

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

    handleForward(dt) {
        if (!this.keys?.KeyW) { 
            this.forward -= this.friction * dt * this.speed_factor;
            this.forward = Math.max(0, this.forward);
            return;
        }

        // if max speed reached don't calc forward
        if (this.forward >= this.max_velocity) {
            this.forward = this.max_velocity;
            return;
        }

        if (!this.forward) {
            this.forward = this.start_velocity;
        } else {
            this.forward += this.acc * dt * this.speed_factor;
        }

        // limit speed
        this.forward = Math.min(this.forward, this.max_velocity);
    }

    handleSide(dt) {
        const [vmin, vmax] = this.side_velocity_min_max;
        const [rmin, rmax] = this.side_rotation_min_max;

        if (!this.keys?.KeyA && !this.keys?.KeyD) {
            if (-0.01 <= this.side && this.side <= 0.01) {
                return;
            }

            const sideFactor = this.side < 0 ? 10 : -10;
            this.side += sideFactor * this.acc * dt;
            this.rotation[2] = -Utils.scale(this.side, vmin, vmax, rmin, rmax);
            return;
        }

        if (this.keys?.KeyA) {
            this.side -= this.acc * dt * this.rotation_speed;
            this.side = Math.max(vmin, this.side);
        } else if (this.keys?.KeyD) {
            this.side += this.acc * dt * this.rotation_speed;
            this.side = Math.min(vmax, this.side);
        }

        this.rotation[2] = -Utils.scale(this.side, vmin, vmax, rmin, rmax);
    }

    update(dt) {
        this.handleForward(dt);
        this.handleSide(dt);

        const xzRotation = QuaternionRotation.calcXZ(-this.forward, this.side * this.forward);
        this.sphere.rotation = QuaternionRotation.rotate(this.sphere.rotation, xzRotation);

        this.sphere.updateMatrix();
        this.updateMatrix();
    }

    stop() {
        this.forward = 0;
        this.side = 0;
        this.rotation[2] = 0;
        this.handleSide();
        this.updateMatrix();
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }
}

Plane.defaults = {
    speed_factor: 0.01,
    rotation_speed: 20,
    start_velocity: 0.001,
    max_velocity: 0.005,
    side_velocity_min_max: [-0.7, 0.7],
    side_rotation_min_max: [-0.3, 0.3],
    friction: 0.15,
    acc: 0.08,
    forward: 0,
    side: 0,
    aabb: {
        min: [-8, -500, 0],
        max: [8, 0, 0],
    }
};