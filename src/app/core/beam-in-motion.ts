import { Vector } from "../common/geometry/vector";
import { Beam, collideBeams, deflectBeams, destroyBronzorBeams } from "../common/prizes";

// Mutable properties of the beam as it traverses the board.
interface BeamState {
  deflectable: boolean;
  collidable: boolean;
  canDestroy: boolean;
};

export interface FiredBeam {
  beam: Beam;
  state: BeamState;
};

export interface BeamInMotion {
  firedBeam: FiredBeam;
  curVector: Vector;
};

// Initialize a FiredBeam with its default state depending on the type of Beam.
export function newFiredBeam(beam: Beam): FiredBeam {
  const state = {
    deflectable: deflectBeams.has(beam),
    collidable: collideBeams.has(beam),
    canDestroy: destroyBronzorBeams.has(beam),
  };
  return {
    beam: beam,
    state: state,
  };
}
