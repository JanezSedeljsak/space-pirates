import { Node } from '../core/Node.js';

export class Model extends Node {

    constructor(mesh, image, options) {
        super(options);
        this.mesh = mesh;
        this.image = image;
    }

}
