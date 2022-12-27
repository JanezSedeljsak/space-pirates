import { PLANET_PLACEHODLDER } from "../config.js";

export class SceneLoader {

    async loadScene(uri, settings) {
        const scene = await this.loadJson(uri);
        const images = scene.textures.map(uri => this.loadImage(uri, settings));

        const meshes = scene.meshes.map(uri => this.loadJson(uri));
        scene.textures = await Promise.all(images);
        scene.meshes = await Promise.all(meshes);

        return scene;
    }

    loadImage(uri, settings) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', reject);
            image.src = this.handleImageURI(uri, settings);
        });
    }

    loadJson(uri) {
        return fetch(uri).then(response => response.json());
    }

    handleImageURI(uri, settings) {
        return uri !== PLANET_PLACEHODLDER
            ? uri
            : `../assets/images/planets/${settings?.planetName ?? ''}_Albedo.png`;
    }

}
