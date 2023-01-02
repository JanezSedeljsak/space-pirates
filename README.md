# Space pirates

Space pirates is a 3D game developed with `WebGL2`. The main goal is to collect the required amount of space rocks that 
are scattered in the planets atmosphere.

You can pick on which planet you will play there are 3 options (Moon, Alien and Tropical). The goal of the game doesn't change
you still have to collect space rocks. There are 25 gold, 3 emerald and 92 (normal rocks - these slow you down and give you a time penalty).

The plane model is a `GLTF` file exproted from Blender, everything else is a normal texture that is generated as a raw `WebGL` model.
For mountains we use height maps which are stored as .avif files and are then parsed by a `WebGL shader`.

The game has a very simple movement system; it's all based on rotating a sphere in the desired direction. The rotations are done with [Quaternions](https://en.wikipedia.org/wiki/Quaternion) to avoid an effect called `gimbal lock`.

The game was a part of a computer-graphics seminar on FRI.

### Requirements

The only requirement is `Node` which you need to run the server. Just type: `npm start` and enjoy.

### Authors:
- Janez Sedeljšak
- Marko Vrečer