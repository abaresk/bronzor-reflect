import { BeamPath } from "./board";
import { Coord } from "./common/geometry/coord";
import { Beam } from "./common/prizes";

export interface Move {
    beam: Beam;
    coord: Coord;
    beamPath: BeamPath;
};
