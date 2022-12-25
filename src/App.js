import { Application } from '../../common/engine/Application.js';

import { Renderer } from './core/Renderer.js';
import { Physics } from './core/Physics.js';
import { Camera } from './core/Camera.js';
import { SceneLoader } from './scene/SceneLoader.js';
import { SceneBuilder } from './scene/SceneBuilder.js';
import { Sphere } from './models/Sphere.js';
import { Plane } from './models/Plane.js';
import { GLTFLoader } from './gltf/GLTFLoader.js';

class App extends Application {

    static gltfLoader = new GLTFLoader();

    async start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = performance.now();
        this.startTime = this.time;
        this.aspect = 1;
        this.isGameFocused = false;

        await App.gltfLoader.load('/common/models/plane_embeded.gltf');
        await this.load('/src/scene.json');

        this.canvas.addEventListener('click', e => this.canvas.requestPointerLock());
        document.addEventListener('pointerlockchange', e => {
            if (document.pointerLockElement === this.canvas) {
                this.camera.enable();
                this.plane.enable();
                this.isGameFocused = true;
            } else {
                this.plane.disable();
                this.camera.disable();
                this.isGameFocused = false;
            }
        });

        document.addEventListener('keydown', event => {
            if (event.code == 'KeyV' && this.isGameFocused) {
                this.camera.toggleFirstPerson();
            }
        })
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri);
        const plane = await App.gltfLoader.loadNode('Plane');
        const builder = new SceneBuilder(scene);

        this.scene = builder.build();
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

        this.plane = plane;
        this.scene.addNode(plane);
        this.plane.sphere = this.sphere;
        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);
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

const canvas = document.querySelector('canvas');
const app = new App(canvas);
await app.init();
document.querySelector('.loader-container').remove();
