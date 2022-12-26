import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from '../models/Node.js';

const CAMERA_VIEW_ENUM = {
    FIRST_PERSON: 0,
    THIRD_PERSON: 1,
    TOP_DOWN: 2
};

export class Camera extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.projection = mat4.create();
        this.updateProjection();

        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};

        this.defaultRotation = Utils.clone(this.rotation);
        this.defaultTranslation = Utils.clone(this.translation);

        // default camera view is third person
        this.cameraView = 1; 
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    toggleFirstPerson() {
        // reset camera to default rotations, translations when switching view
        this.rotation = Utils.clone(this.defaultRotation);
        this.translation = Utils.clone(this.defaultTranslation);

        this.cameraView = (this.cameraView + 1) % 3;
        switch (this.cameraView) {
            case CAMERA_VIEW_ENUM.FIRST_PERSON:
                this.translation[2] = -2;
                break;

            case CAMERA_VIEW_ENUM.THIRD_PERSON:
                this.translation[2] = 6;
                break;

            case CAMERA_VIEW_ENUM.TOP_DOWN:
                this.translation[2] = 0;
                this.translation[1] = 7;
                this.rotation[0] = -1.5;
                break;

            default:
                throw Error('Unknown camera position');
        }
    }

    update(dt) {
        /*const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));

        // 1: add movement acceleration
        const acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }*/
    }

    enable() {
        document.addEventListener('pointermove', this.pointermoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('pointermove', this.pointermoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (const key in this.keys) {
            this.keys[key] = false;
        }
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        switch (c.cameraView) {
            case CAMERA_VIEW_ENUM.FIRST_PERSON:
                c.rotation[0] -= dy * c.pointerSensitivity;
                c.rotation[1] -= dx * c.pointerSensitivity;
                break;

            case CAMERA_VIEW_ENUM.THIRD_PERSON:
                const newX = c.translation[0] + 1.1 * dx * c.pointerSensitivity; // horizontal view has to be between (-2, 2)
                const newY = c.translation[1] - 1.1 * dy * c.pointerSensitivity; // vertical view has to be between (0, 2)

                if (Math.abs(newX) < 2 && 0 < newY && newY < 3) {
                    c.translation[0] = newX;
                    c.translation[1] = newY;
                    c.rotation[0] += .3 * dy * c.pointerSensitivity;
                    c.rotation[1] += .3 * dx * c.pointerSensitivity;
                }
                break;

            case CAMERA_VIEW_ENUM.TOP_DOWN:
            default:
                return;
        }

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;
        
        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

}

Camera.defaults = {
    aspect           : 1,
    fov              : 1.5,
    near             : 0.01,
    far              : 100,
    velocity         : [0, 0, 0],
    pointerSensitivity : 0.002,
    maxSpeed         : 3,
    friction         : 0.2,
    acceleration     : 20
};
