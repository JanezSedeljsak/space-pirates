import { Sphere } from "./Sphere.js";
import { mat4, quat, vec3 } from '../../lib/gl-matrix-module.js';
import { SPHERE_TYPE_ENUM } from "../config.js";

export class Asteroid extends Sphere {

    constructor(mesh, texture, spec, radius) {
        const props = [mesh, texture, spec, radius];
        super(mesh, texture, spec, null);
        this._props = props;
        this.radius = radius;
        this.type = SPHERE_TYPE_ENUM.ROCK_ASTEROID;

        this.light.intensity = 1;
        this.material.diffuse = 10;
        this.material.specular = 1;
        this.material.shininess = 1;
    }

    setTranslation(tVector) {
        this.translation = tVector;
        this.updateMatrix();
    }

    setGoldType() {
        this.type = SPHERE_TYPE_ENUM.GOLD_ASTEROID;
    }

    setEmerald() {
        this.type = SPHERE_TYPE_ENUM.EMERALD_ASTEROID;
        this.material.shininess = 100;
    }

    isSphere() {
        return false;
    }

    isAsteroid() {
        return true;
    }

    isGoldAsteroid() {
        return this.type === SPHERE_TYPE_ENUM.GOLD_ASTEROID;
    }

    isEmerald() {
        return this.type === SPHERE_TYPE_ENUM.EMERALD_ASTEROID;
    }
    
    getDisplacementScale() {
        return -0.25;
    }

    getObjectType() {
        return this.type;
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