import { Model } from './core/Model.js';
import { Plane } from './models/Plane.js';

export const MODEL_ENUM = {
    model: Model,
    plane: Plane,
};

export const CAMERA_VIEW_ENUM = {
    FIRST_PERSON: 0,
    THIRD_PERSON: 1,
    TOP_DOWN: 2
};

export const STATE_KEY = "state";
export const SCOREBOARD_KEY = "scoreboard";
export const PLANET_PLACEHODLDER = 'PLANET_PLACEHODLDER';