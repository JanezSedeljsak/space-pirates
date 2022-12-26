import { Node } from '../core/Node.js';

export class GLTFNode extends Node {

    constructor(options = {}) {
        const props = { ...options };
        super(options);
        this._props = props;
    }

    clone() {
        return new GLTFNode(this._props);
    }
}
