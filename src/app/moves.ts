import { BeamPath } from "./board";
import { Coord } from "./common/coord";
import { Beam } from "./common/prizes";

export interface Move {
    beam: Beam;
    coord: Coord;
    beamPath: BeamPath;
};
