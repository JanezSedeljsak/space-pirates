import { vec3 } from '../../lib/gl-matrix-module.js';
import { SPHERE_TYPE_ENUM } from '../config.js';

export class Physics {

    constructor(scene, plane, sphere, guiController) {
        this.plane = plane;
        this.scene = scene;
        this.sphere = sphere;
        this.guiController = guiController;
    }

    update() {
        // check plane collisions
        this.scene.traverse(node => {
            if (!node.isIgnoreCollision() && node.isAsteroid() && this.plane !== node) {
                this.resolveCollision(this.plane, node);
            }
        });
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    getTransformedAABB(node) {
        // Transform all vertices of the AABB from local to global space.
        const transform = node.getGlobalTransform();
        const { min, max } = node.aabb;
        const vertices = [
            [min[0], min[1], min[2]],
            [min[0], min[1], max[2]],
            [min[0], max[1], min[2]],
            [min[0], max[1], max[2]],
            [max[0], min[1], min[2]],
            [max[0], min[1], max[2]],
            [max[0], max[1], min[2]],
            [max[0], max[1], max[2]],
        ].map(v => vec3.transformMat4(v, v, transform));

        // Find new min and max by component.
        const xs = vertices.map(v => v[0]);
        const ys = vertices.map(v => v[1]);
        const zs = vertices.map(v => v[2]);
        const newmin = [Math.min(...xs), Math.min(...ys), Math.min(...zs)];
        const newmax = [Math.max(...xs), Math.max(...ys), Math.max(...zs)];
        return { min: newmin, max: newmax };
    }

    resolveCollision(a, b) {
        // Get global space AABBs.
        const aBox = this.getTransformedAABB(a);
        const bBox = this.getTransformedAABB(b);

        // Check if there is collision.
        const isColliding = this.aabbIntersection(aBox, bBox);
        if (!isColliding) {
            return;

        } else if (b.isAsteroid()) {
            this.sphere.removeChild(b);
            switch (b.type) {
                case SPHERE_TYPE_ENUM.EMERALD_ASTEROID:
                    this.guiController.soundController.playSound("collect_crystal");
                    this.guiController.addGameScore(3);
                    break;
                case SPHERE_TYPE_ENUM.GOLD_ASTEROID:
                    this.guiController.soundController.playSound("collect");
                    this.guiController.addGameScore();
                    break;
                case SPHERE_TYPE_ENUM.ROCK_ASTEROID:
                    this.guiController.soundController.playSound("crash");
                    this.plane.forward *= 0.7;
                    this.guiController.negativeCollect();
                    break;
            }

            return;
        }
    }
}
