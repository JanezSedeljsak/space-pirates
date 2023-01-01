import { Model } from './core/Model.js';
import { Plane } from './models/Plane.js';
import { SkyBox } from './models/SkyBox.js';

export const MODEL_ENUM = {
    model:          Model,
    plane:          Plane,
    skybox:         SkyBox
};

export const CAMERA_VIEW_ENUM = {
    FIRST_PERSON:   0,
    THIRD_PERSON:   1,
    TOP_DOWN:       2
};

export const SPHERE_TYPE_ENUM = {
    SPHERE: 0,
    GOLD_ASTEROID:  1,
    ROCK_ASTEROID:  2
};

export const SEGMENTS_COUNT_ENUM = {
    sphere:         256,
    asteroid:       48
};

export const STATE_KEY = "state";
export const SCOREBOARD_KEY = "scoreboard";
export const PLANET_PLACEHODLDER = 'PLANET_PLACEHODLDER';

export const END_GAME_SCORE = 10;
export const ASTEROIDS_AMOUNT = 100;
export const GOLD_AMOUNT = 25;

export const IS_DEBUG = false;