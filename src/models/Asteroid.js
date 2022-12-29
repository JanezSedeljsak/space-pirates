import { Sphere } from "./Sphere.js";

export class Asteroid extends Sphere {

    constructor(mesh, texture, spec, radius) {
        const props = [mesh, texture, spec, radius];
        super(mesh, texture, spec, null);
        this._props = props;
        this.radius = radius;

        //this.translation = [5, 110, -5];
        //this.updateMatrix();
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

    clone() {
        return new Asteroid(...this._props);
    }

    async loadHeightMap() {
        const [heightMap, normalMap] = await Promise.all([
            this.loadTexture(`../../assets/images/asteroids/Asteroid_Height.png`),
            this.loadTexture(`../../assets/images/asteroids/Asteroid_Normal.png`)
        ]);
        
        this.heightMap = heightMap;
        this.normalMap = normalMap;
    }
}