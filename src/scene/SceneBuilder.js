import { Mesh } from '../core/Mesh.js';

import { Node } from '../core/Node.js';
import { Model } from '../models/Model.js';
import { Camera } from '../core/Camera.js';

import { Scene } from './Scene.js';
import { Sphere } from '../models/Sphere.js';
import { Plane } from '../models/Plane.js';
export class SceneBuilder {

    constructor(spec) {
        this.spec = spec;
    }

    createNode(spec) {
        switch (spec.type) {
            case 'camera': return new Camera(spec);
            case 'plane':
            case 'model': {
                const mesh = new Mesh(this.spec.meshes[spec.mesh]);
                const texture = this.spec.textures[spec.texture];
                const args = [mesh, texture, spec];
                return spec.type === 'plane'
                    ? new Plane(...args)
                    : new Model(...args);
            }
            case 'sphere': {
                const mesh = new Mesh(Sphere.createGlobe(spec?.radius));
                const texture = this.spec.textures[spec.texture];
                return new Sphere(mesh, texture, spec);
            }
            default: return new Node(spec);
        }
    }

    build() {
        let scene = new Scene();
        this.spec.nodes.forEach(spec => scene.addNode(this.createNode(spec)));
        return scene;
    }

}
