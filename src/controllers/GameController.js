import { Application } from '../engine/Application.js';

import { Renderer } from '../core/Renderer.js';
import { Physics } from '../core/Physics.js';
import { Camera } from '../core/Camera.js';
import { SceneLoader } from '../scene/SceneLoader.js';
import { SceneBuilder } from '../scene/SceneBuilder.js';
import { Sphere } from '../models/Sphere.js';
import { GLTFLoader } from '../gltf/GLTFLoader.js';

// user settings
const initialState = {
    radius: 150
};

export class GameController extends Application {

    constructor(...args) {
        super(...args);
        this.toggleFirstPerson = this.toggleFirstPerson.bind(this);
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

    toggleFirstPerson() {
        if (this.isGameFocused) {
            this.camera.toggleFirstPerson();
        }
    }

    pointerLockChange(event) {
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
        const scene = await new SceneLoader().loadScene(uri);

        const [plane, balloon] = await Promise.all([
            this.planeLoader.loadNode('Plane'),
        ]);

        this.plane = plane;

        const builder = new SceneBuilder(scene);

        this.scene = builder.build(initialState);
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
        const t = this.time = performance.now();
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
