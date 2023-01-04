import { Application } from '../engine/Application.js';
import { Renderer } from '../core/Renderer.js';
import { Physics } from '../core/Physics.js';
import { Camera } from '../core/Camera.js';
import { SceneLoader } from '../scene/SceneLoader.js';
import { SceneBuilder } from '../scene/SceneBuilder.js';
import { GLTFLoader } from '../gltf/GLTFLoader.js';
import { STATE_KEY, ASTEROIDS_AMOUNT, GOLD_AMOUNT, EMERALD_AMOUNT } from '../config.js';
import { PointGenerator } from '../core/PointGenerator.js';

export class GameController extends Application {
    constructor(guiController, ...args) {
        super(...args);
        this.guiController = guiController;
        this.toggleFirstPerson = this.toggleFirstPerson.bind(this);
        this._state = this.init_state;
    }

    async controller_init({ isSandbox }) {
        this.isSandbox = isSandbox;
        await this.start();
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
            this.planeLoader.load('/assets/models/spacecraft.gltf'),
        ]);

        await this.load('/src/scene.json');
    }

    get init_state() {
        if (localStorage.getItem(STATE_KEY) !== null) {
            const stateJSON = localStorage.getItem(STATE_KEY);
            const persistedState = JSON.parse(stateJSON);
            return persistedState;
        }

        return {
            planetName: 'Moon',
            soundVolume: 0.5,
            username: '',
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

        localStorage.setItem(STATE_KEY, JSON.stringify(this.state));
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

        // Find game objects
        this.camera = null;
        this.sphere = null;

        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            } else if (node.isSphere()) {
                this.sphere = node;
            }
        });

        this.physics = new Physics(this.scene, this.plane, this.sphere, this.guiController);
        this.plane.sphere = this.sphere;
        this.sphere.plane = this.plane;
        this.sphere.children = [];

        const { skybox, asteroid, earth } = this.scene.extras;
        await asteroid.initializeHeightMap();

        if (!this.isSandbox) {
            const asteroidPositions = PointGenerator.multipleUniq({
                amount: ASTEROIDS_AMOUNT,
                offset: this.sphere.verticalOffset,
                dist: asteroid.radius * 5,
                center: [0, -this.sphere.verticalOffset, 0]
            });

            asteroidPositions.forEach((ap, idx) => {
                const aCpy = asteroid.clone();
                aCpy.setTranslation(ap);

                if (idx < EMERALD_AMOUNT) {
                    aCpy.setEmerald();
                } else if (idx < GOLD_AMOUNT + EMERALD_AMOUNT) {
                    aCpy.setGoldType();
                }

                this.sphere.addChild(aCpy);
            });
        }

        this.scene.addNode(this.plane);
        this.sphere.addChild(earth);

        this.camera.addChild(skybox);
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
        this.physics.update(dt);
        this.camera.updateMatrix();

        for (const node of this.sphere.children) {
            node.update(dt);
        }
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
