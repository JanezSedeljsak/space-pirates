import { BufferView } from './BufferView.js';
import { Accessor } from './Accessor.js';
import { Sampler } from './Sampler.js';
import { Texture } from './Texture.js';
import { Material } from './Material.js';
import { Primitive } from './Primitive.js';
import { Mesh } from '../core/Mesh.js';
import { Plane } from '../models/Plane.js';
import { GLTFNode } from './GLTFNode.js';

export class GLTFLoader {

    constructor() {
        this.gltf = null;
        this.gltfUrl = null;

        this.cache = new Map();
    }

    async fetchJson(url) {
        return fetch(url)
            .then(response => response.json());
    }

    async fetchBuffer(url) {
        return fetch(url)
            .then(response => response.arrayBuffer());
    }

    async fetchImage(url) {
        return fetch(url)
            .then(response => response.blob())
            .then(blob => createImageBitmap(blob));
    }

    findByNameOrIndex(set, nameOrIndex) {
        if (typeof nameOrIndex === 'number') {
            return set[nameOrIndex];
        } else {
            return set.find(element => element.name === nameOrIndex);
        }
    }

    async load(url) {
        this.gltfUrl = new URL(url, window.location);
        this.gltf = await this.fetchJson(url);
        this.defaultScene = this.gltf.scene ?? 0;
    }

    async loadImage(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.images, nameOrIndex);
        if (!gltfSpec) {
            return null;
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        if (gltfSpec.uri) {
            const url = new URL(gltfSpec.uri, this.gltfUrl);
            const image = await this.fetchImage(url);
            this.cache.set(gltfSpec, image);
            return image;
        } else {
            const bufferView = await this.loadBufferView(gltfSpec.bufferView);
            const dataView = new DataView(bufferView.buffer, bufferView.byteOffset, bufferView.byteLength);
            const blob = new Blob([dataView], { type: gltfSpec.mimeType });
            const url = URL.createObjectURL(blob);
            const image = await this.fetchImage(url);
            URL.revokeObjectURL(url);
            this.cache.set(gltfSpec, image);
            return image;
        }
    }

    async loadBuffer(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.buffers, nameOrIndex);
        if (!gltfSpec) {
            return null;
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const url = new URL(gltfSpec.uri, this.gltfUrl);
        const buffer = await this.fetchBuffer(url);
        this.cache.set(gltfSpec, buffer);
        return buffer;
    }

    async loadBufferView(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.bufferViews, nameOrIndex);
        if (!gltfSpec) {
            return null;
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const bufferView = new BufferView({
            ...gltfSpec,
            buffer: await this.loadBuffer(gltfSpec.buffer),
        });
        this.cache.set(gltfSpec, bufferView);
        return bufferView;
    }

    async loadAccessor(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.accessors, nameOrIndex);
        if (!gltfSpec) {
            return null;
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const accessorTypeToNumComponentsMap = {
            SCALAR: 1,
            VEC2: 2,
            VEC3: 3,
            VEC4: 4,
            MAT2: 4,
            MAT3: 9,
            MAT4: 16,
        };

        const accessor = new Accessor({
            ...gltfSpec,
            bufferView: await this.loadBufferView(gltfSpec.bufferView),
            numComponents: accessorTypeToNumComponentsMap[gltfSpec.type],
        });
        this.cache.set(gltfSpec, accessor);
        return accessor;
    }

    async loadSampler(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.samplers, nameOrIndex);
        if (!gltfSpec) {
            return null;
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const sampler = new Sampler({
            min: gltfSpec.minFilter,
            mag: gltfSpec.magFilter,
            wrapS: gltfSpec.wrapS,
            wrapT: gltfSpec.wrapT,
        });
        this.cache.set(gltfSpec, sampler);
        return sampler;
    }

    async loadTexture(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.textures, nameOrIndex);
        if (!gltfSpec) {
            return null;
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const options = {};
        if (gltfSpec.source !== undefined) {
            options.image = await this.loadImage(gltfSpec.source);
        }
        if (gltfSpec.sampler !== undefined) {
            options.sampler = await this.loadSampler(gltfSpec.sampler);
        }

        const texture = new Texture(options);
        this.cache.set(gltfSpec, texture);
        return texture;
    }

    async loadMaterial(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.materials, nameOrIndex);
        if (!gltfSpec) {
            return null;
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const options = {};
        const pbr = gltfSpec.pbrMetallicRoughness;
        if (pbr !== undefined) {
            if (pbr.baseColorTexture !== undefined) {
                options.baseColorTexture = await this.loadTexture(pbr.baseColorTexture.index);
                options.baseColorTexCoord = pbr.baseColorTexture.texCoord;
            }
            if (pbr.metallicRoughnessTexture !== undefined) {
                options.metallicRoughnessTexture = await this.loadTexture(pbr.metallicRoughnessTexture.index);
                options.metallicRoughnessTexCoord = pbr.metallicRoughnessTexture.texCoord;
            }
            options.baseColorFactor = pbr.baseColorFactor;
            options.metallicFactor = pbr.metallicFactor;
            options.roughnessFactor = pbr.roughnessFactor;
        }

        if (gltfSpec.normalTexture !== undefined) {
            options.normalTexture = await this.loadTexture(gltfSpec.normalTexture.index);
            options.normalTexCoord = gltfSpec.normalTexture.texCoord;
            options.normalFactor = gltfSpec.normalTexture.scale;
        }

        if (gltfSpec.occlusionTexture !== undefined) {
            options.occlusionTexture = await this.loadTexture(gltfSpec.occlusionTexture.index);
            options.occlusionTexCoord = gltfSpec.occlusionTexture.texCoord;
            options.occlusionFactor = gltfSpec.occlusionTexture.strength;
        }

        if (gltfSpec.emissiveTexture !== undefined) {
            options.emissiveTexture = await this.loadTexture(gltfSpec.emissiveTexture.index);
            options.emissiveTexCoord = gltfSpec.emissiveTexture.texCoord;
            options.emissiveFactor = gltfSpec.emissiveFactor;
        }

        options.alphaMode = gltfSpec.alphaMode;
        options.alphaCutoff = gltfSpec.alphaCutoff;
        options.doubleSided = gltfSpec.doubleSided;

        const material = new Material(options);
        this.cache.set(gltfSpec, material);
        return material;
    }

    async loadMesh(nameOrIndex) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.meshes, nameOrIndex);
        if (!gltfSpec) {
            return null;
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const options = { primitives: [] };
        for (const primitiveSpec of gltfSpec.primitives) {
            const primitiveOptions = {};
            primitiveOptions.attributes = {};
            for (const name in primitiveSpec.attributes) {
                primitiveOptions.attributes[name] = await this.loadAccessor(primitiveSpec.attributes[name]);
            }
            if (primitiveSpec.indices !== undefined) {
                primitiveOptions.indices = await this.loadAccessor(primitiveSpec.indices);
            }
            if (primitiveSpec.material !== undefined) {
                primitiveOptions.material = await this.loadMaterial(primitiveSpec.material);
            }
            primitiveOptions.mode = primitiveSpec.mode;
            const primitive = new Primitive(primitiveOptions);
            options.primitives.push(primitive);
        }

        const mesh = new Mesh(options);
        this.cache.set(gltfSpec, mesh);
        return mesh;
    }

    async loadNode(nameOrIndex, state) {
        const gltfSpec = this.findByNameOrIndex(this.gltf.nodes, nameOrIndex);
        if (!gltfSpec) {
            return null;
        }
        if (this.cache.has(gltfSpec)) {
            return this.cache.get(gltfSpec);
        }

        const options = { ...gltfSpec, children: [] };
        if (gltfSpec.children) {
            for (const nodeIndex of gltfSpec.children) {
                const node = await this.loadNode(nodeIndex);
                options.children.push(node);
            }
        }

        if (gltfSpec.mesh !== undefined) {
            options.mesh = await this.loadMesh(gltfSpec.mesh);
        }

        const node = options?.name === 'Plane' 
            ? new Plane(options, state)
            : new GLTFNode(options);
            
        this.cache.set(gltfSpec, node);
        return node;
    }

}