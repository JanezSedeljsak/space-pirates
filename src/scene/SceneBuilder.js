import { Mesh } from '../core/Mesh.js';

import { Node } from '../core/Node.js';
import { Model } from '../core/Model.js';
import { Camera } from '../core/Camera.js';

import { Scene } from './Scene.js';
import { Sphere } from '../models/Sphere.js';
import { Plane } from '../models/Plane.js';

const MODEL_ENUM = {
    model: Model,
    plane: Plane,
};

export class SceneBuilder {

    constructor(spec) {
        this.spec = spec;
    }

    createNode(spec, settings) {
        switch (spec.type) {
            case 'camera': return new Camera(spec);
            case 'plane':
            case 'model': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                const args = [mesh, texture, spec];
                return new MODEL_ENUM[spec.type](...args);
            }
            case 'sphere': {
                const [sphereMesh, radius] = Sphere.createGlobe(settings?.radius ?? spec?.radius);
                const mesh = new Mesh(sphereMesh);
                const texture = this.spec.textures[spec.texture];
                const sphere = new Sphere(mesh, texture, spec, radius);
                return sphere;
            }
            default: return new Node(spec);
        }
    }

    build(settings) {
        let scene = new Scene();
        this.spec.nodes.forEach(spec => scene.addNode(this.createNode(spec, settings)));
        return scene;
    }

}
