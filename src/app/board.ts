import { Coord } from './common/geometry/coord';
import { Beam, PrizeState } from './common/prizes';

/**
 * Bronzors
 */

export interface Bronzor {
    coord: Coord;
    active: boolean;
    visible: boolean;
}

/**
 * Beam paths
 */

export enum BeamPointType {
    // Enters the box
    Entry,
    // Bounces off a Bronzor
    Deflect,
    // Bounces off two Bronzors on the same tile.
    DoubleDeflect,
    // Destroys a Bronzor
    Destroy,
    // Phases through a Bronzor
    Phase,
    // Emitted from the box. A final step.
    Emit,
    // Collides with a Bronzor. A final step.
    Hit,
}

export interface BeamPoint {
    type: BeamPointType;
    coord: Coord;
}

export interface BeamPath {
    type: Beam;
    path: Array<BeamPoint>;
}

/**
 * Board state
 */

export interface BoardConfig {
    bronzorCount: number;
    length: number;
}

export interface BoardHistory {
    beamPaths: Array<BeamPath>;
}

export interface Board {
    config: BoardConfig;
    bronzors: Array<Bronzor>;
    prizes: Array<PrizeState | undefined>;
    history: BoardHistory;
}
