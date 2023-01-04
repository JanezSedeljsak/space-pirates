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

export const STATE_KEY = "state";
export const SCOREBOARD_KEY = "scoreboard";
export const PLANET_PLACEHODLDER = 'PLANET_PLACEHODLDER';
export const PLANE_ROTATION_VECTOR = [1.6, 3.15, 0];

export const END_GAME_SCORE = 15;
export const ASTEROIDS_AMOUNT = 120;
export const GOLD_AMOUNT = 25;
export const EMERALD_AMOUNT = 3;
export const CENTER_OFFSET = 20;

export const IS_DEBUG = false;