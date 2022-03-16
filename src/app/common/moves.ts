import { BeamPath } from "./board";
import { Coord } from "./geometry/coord";
import { Beam } from "./prizes";

export interface Move {
  beam: Beam;
  coord: Coord;
  beamPath: BeamPath;
};
