import { Beam } from "../parameters/beams";
import { BeamPath } from "./board";
import { Coord } from "./geometry/coord";

export interface Move {
  beam: Beam;
  coord: Coord;
  beamPath: BeamPath;
};
