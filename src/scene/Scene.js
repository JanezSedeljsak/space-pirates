export class Scene {

    constructor() {
        this.nodes = [];
    }

    addNode(node) {
        this.nodes.push(node);
    }

    removeNode(node) {
        const index = this.nodes.indexOf(node);
        if (index >= 0) {
            this.nodes.splice(index, 1);
            node.parent = null;
        }
    }

    traverse(before, after) {
        this.nodes.forEach(node => node.traverse(before, after));
    }

}
