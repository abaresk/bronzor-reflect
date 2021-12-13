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

// Enters the box
type Entry = Coord;

// Bounces off a Bronzor
type Deflect = Coord;

// Bounces off two Bronzors on the same tile.
type DoubleDeflect = Coord;

// Destroys a Bronzor
type Destroy = Coord;

// Phases through a Bronzor
type Phase = Coord;

// Emitted from the box. A final step.
type Emit = Coord;

// Collides with a Bronzor. A final step.
type Hit = Coord;

type PathStep = | Entry | Deflect | Destroy | Phase | Emit | DoubleDeflect | Hit;

interface BeamPath {
    type: Beam;
    path: Array<PathStep>;
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
