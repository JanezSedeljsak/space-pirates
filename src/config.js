import { Model } from './core/Model.js';
import { Plane } from './models/Plane.js';
import { SkyBox } from './models/SkyBox.js';

export const MODEL_ENUM = {
    model:              Model,
    plane:              Plane,
    skybox:             SkyBox
};

export const CAMERA_VIEW_ENUM = {
    FIRST_PERSON:       0,
    THIRD_PERSON:       1,
    TOP_DOWN:           2
};

export const SPHERE_TYPE_ENUM = {
    SPHERE:             0,
    GOLD_ASTEROID:      1,
    ROCK_ASTEROID:      2,
    EMERALD_ASTEROID:   3,
    EARTH:              4
};

export const SEGMENTS_COUNT_ENUM = {
    sphere:             256,
    asteroid:           48,
    earth:              128
};

// this is plane name -> gltf file
export const PLANE_OPTION_ENUM = {
    speed:              'spacecraft',
    control:            'plane4'
};

export const PLANE_CHARACTERISTICS_ENUM = {
    speed: {
        side_velocity_min_max: [-0.8, 0.8],
        side_rotation_min_max: [-0.4, 0.4],
        rotation_speed: 30,
        max_velocity: 0.006,
        acc: 0.08,
        aabb: {
            // aabb is big because the model is scaled
            min: [-8, -500, 0],
            max: [8, 0, 0],
        }
    },
    control: {
        side_velocity_min_max: [-0.8, 0.8],
        side_rotation_min_max: [-0.6, 0.6],
        rotation_speed: 50,
        max_velocity: 0.004,
        acc: 0.08,
        aabb: {
            min: [-0.5, -10, 0],
            max: [0.5, 0, 0],
        }
    }
};

export const PLANE_ROTATION_VECTOR_ENUM = {
    speed: [1.6, 3.15, 0],
    control: [0, 0, 0]
};

export const STATE_KEY = "state";
export const SCOREBOARD_KEY = "scoreboard";
export const PLANET_PLACEHODLDER = 'PLANET_PLACEHODLDER';

export const END_GAME_SCORE = 10; // this used to be 15 but we made it a bit easier so games don't last that long
export const ASTEROIDS_AMOUNT = 130;
export const GOLD_AMOUNT = 27;
export const EMERALD_AMOUNT = 3;
export const CENTER_OFFSET = 20;

export const IS_DEBUG = false;