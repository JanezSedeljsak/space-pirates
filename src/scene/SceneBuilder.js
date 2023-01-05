import { Mesh } from '../core/Mesh.js';
import { Node } from '../core/Node.js';
import { Camera } from '../core/Camera.js';
import { Scene } from './Scene.js';
import { Sphere } from '../models/Sphere.js';
import { Asteroid } from '../models/Asteroid.js';
import { MODEL_ENUM, SEGMENTS_COUNT_ENUM } from '../config.js';
import { Earth } from '../models/Earth.js';

export class SceneBuilder {

    constructor(spec) {
        this.spec = spec;
    }

    createNode(spec, settings) {
        switch (spec.type) {
            case 'camera': return new Camera(spec);
            // case 'plane': -> PLANE is loaded in GLTF loader
            case 'skybox':
            case 'model': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                return new MODEL_ENUM[spec.type](mesh, texture, spec);
            }
            case 'asteroid':
            case 'earth':
            case 'sphere': {
                const [sphereMesh, radius] = Sphere.createGlobe({
                    radius: settings?.radius ?? spec?.radius,
                    segments: SEGMENTS_COUNT_ENUM[spec.type]
                });

                const mesh = new Mesh(sphereMesh);
                const texture = this.spec.textures[spec.texture];
                if (spec.type === 'sphere') {
                    const sphere = new Sphere(mesh, texture, spec, radius, settings.planetName);
                    return sphere;
                }

                if (spec.type === 'earth') {
                    const earth = new Earth(mesh, texture, spec, radius);
                    return earth;
                }

                const asteroid = new Asteroid(mesh, texture, spec, radius);
                return asteroid;
            }
            default: return new Node(spec);
        }
    }

    build(settings) {
        let scene = new Scene();
        // console.log(settings);
        this.spec.nodes.forEach(spec => scene.addNode(this.createNode(spec, settings)));
        this.spec.extras.forEach(spec => scene.addExtra(spec.type, this.createNode(spec, settings)));
        return scene;
    }

}
