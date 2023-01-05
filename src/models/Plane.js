import { GLTFNode } from "../gltf/GLTFNode.js";
import { PLANE_CHARACTERISTICS_ENUM, PLANE_ROTATION_VECTOR_ENUM } from "../config.js";
import { QuaternionRotation } from "../core/QuaternionRotation.js";
import { Utils } from "../core/Utils.js";

export class Plane extends GLTFNode {

    static MAX_SPEED = 0.0065;

    constructor(options, state) {
        super(options);
        const { planeModel } = state;
        const specificOptions = {
            ...Plane.defaults,
            ...PLANE_CHARACTERISTICS_ENUM[planeModel]
        };

        Utils.init(this, specificOptions, options);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        this.rotation = PLANE_ROTATION_VECTOR_ENUM[planeModel];
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
            if (-0.02 <= this.side && this.side <= 0.02) {
                this.side = 0;
                return;
            }

            const sideFactor = this.side < 0 ? 1 : -1;
            this.side += sideFactor * this.rotation_speed * dt * this.acc;
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
    side_velocity_min_max: [-0.8, 0.8],
    side_rotation_min_max: [-0.4, 0.4],
    rotation_speed: 30,
    max_velocity: Plane.MAX_SPEED,
    acc: 0.08,
    aabb: {
        min: [0, 0, 0],
        max: [0, 0, 0],
    },

    // these are mostly constants and shouldn't be changed
    speed_factor: 0.01,
    start_velocity: 0.001,
    friction: 0.13,
    forward: 0,
    side: 0,
};