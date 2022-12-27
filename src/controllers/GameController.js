import { Application } from '../engine/Application.js';

import { Renderer } from '../core/Renderer.js';
import { Physics } from '../core/Physics.js';
import { Camera } from '../core/Camera.js';
import { SceneLoader } from '../scene/SceneLoader.js';
import { SceneBuilder } from '../scene/SceneBuilder.js';
import { Sphere } from '../models/Sphere.js';
import { GLTFLoader } from '../gltf/GLTFLoader.js';

export class GameController extends Application {

    constructor(...args) {
        super(...args);
        this.toggleFirstPerson = this.toggleFirstPerson.bind(this);
        this._state = this.init_state;
    }

    async start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = performance.now();
        this.startTime = this.time;
        this.aspect = 1;
        this.isGameFocused = false;

        this.planeLoader = new GLTFLoader();

        // load all gltf models
        await Promise.all([
            this.planeLoader.load('/assets/models/plane4.gltf'),
        ]);

        await this.load('/src/scene.json');
    }

    get init_state() {
        return {
            planetName: 'Moon'
        };
    }
    
    get state() {
        return this._state;
    }

    setState(newState) {
        // avoid changing the state reference object
        for (const key in newState) {
            this._state[key] = newState[key];
        }
    }

    toggleFirstPerson() {
        if (this.isGameFocused) {
            this.camera.toggleFirstPerson();
        }
    }

    pointerLockChange() {
        if (document.pointerLockElement === this.canvas) {
            this.camera.enable();
            this.plane.enable();
            this.isGameFocused = true;
        } else {
            this.plane.disable();
            this.camera.disable();
            this.isGameFocused = false;
        }
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri, this.state);
        this.plane = await this.planeLoader.loadNode('Plane');
        const builder = new SceneBuilder(scene);

        this.scene = builder.build(this.state);
        this.physics = new Physics(this.scene);

        // Find game objects
        this.camera = null;
        this.sphere = null;

        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            } else if (node instanceof Sphere) {
                this.sphere = node;
            }
        });

        this.scene.addNode(this.plane);
        this.plane.sphere = this.sphere;
        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);
        console.log(this.scene);
    }

    update() {
        this.time = performance.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        this.plane.update(dt);
        this.camera.update(dt);
        this.physics.update(dt);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }
}
