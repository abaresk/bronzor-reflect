import { Coord } from './coord';
import { Beam, PrizeState } from './items';

/**
 * Bronzors
 */

interface Bronzor {
    coord: Coord;
    active: boolean;
}

/**
 * Beam paths
 */

enum BeamPointType {
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

interface BeamPoint {
    type: BeamPointType;
    coord: Coord;
}

interface BeamPath {
    type: Beam;
    path: Array<BeamPoint>;
}

/**
 * Board state
 */

interface BoardConfig {
    bronzorCount: number;
    length: number;
}

interface BoardHistory {
    beamPaths: Array<BeamPath>;
}

interface Board {
    config: BoardConfig;
    bronzors: Array<Bronzor>;
    prizes: Array<PrizeState>;
    history: BoardHistory;
}

export {
    BeamPath,
    BeamPoint,
    BeamPointType,
    Board,
    BoardConfig,
    BoardHistory,
    Bronzor,
};
