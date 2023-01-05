export class Scene {

    constructor() {
        this.nodes = [];
        this.extras = {}; // extra nodes map - <NodeType, Node>
    }

    addNode(node) {
        this.nodes.push(node);
    }

    addExtra(key, node) {
        this.extras[key] = node;
    }

    hasNode(check) {
        return this.nodes.some(check);
    }

    checkDelete(check) {
        // keep nodes that don't match check
        return this.nodes.filter(x => !check(x));
    }

    removeNode(node) {
        const index = this.nodes.indexOf(node);
        if (index >= 0) {
            this.nodes.splice(index, 1);
            node.parent = null;
        }
    }

    traverse(before, after) {
        for (const node of this.nodes) {
            this.traverseNode(node, before, after);
        }
    }

    traverseNode(node, before, after) {
        if (before) {
            before(node);
        }
        for (const child of node.children) {
            this.traverseNode(child, before, after);
        }
        if (after) {
            after(node);
        }
    }

}
