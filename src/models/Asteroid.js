import { Sphere } from "./Sphere.js";
import { mat4, quat, vec3 } from '../../lib/gl-matrix-module.js';

export class Asteroid extends Sphere {

    constructor(mesh, texture, spec, radius) {
        const props = [mesh, texture, spec, radius];
        super(mesh, texture, spec, null);
        this._props = props;
        this.radius = radius;

        this.light.intensity = 1;
        this.material.diffuse = 10;
        this.material.specular = 1;
        this.material.shininess = 1;
    }

    setTranslation(tVector) {
        this.translation = tVector;
        this.updateMatrix();
    }

    isSphere() {
        return false;
    }

    isAsteroid() {
        return true;
    }
    
    getDisplacementScale() {
        return -0.5;
    }

    clone() {
        const asteroid = new Asteroid(...this._props);
        asteroid.heightMap = this.heightMap;
        asteroid.normalMap = this.normalMap;
        return asteroid;
    }

    update(dt) {
        this.rotation[2] += dt;
        this.updateMatrix();
    }

    updateMatrix() {
        const m = this.matrix;
        const degrees = this.rotation.slice(0, 3).map(x => x * 180 / Math.PI);
        const q = quat.fromEuler(quat.create(), ...degrees);
        const v = vec3.clone(this.translation);
        const s = vec3.clone(this.scale);
        mat4.fromRotationTranslationScale(m, q, v, s);
    }

    async initializeHeightMap() {
        const [heightMap, normalMap] = await Promise.all([
            this.loadTexture(`../../assets/images/asteroids/Asteroid_Height.avif`),
            this.loadTexture(`../../assets/images/asteroids/Asteroid_Normal.avif`)
        ]);
        
        this.heightMap = heightMap;
        this.normalMap = normalMap;
    }
}