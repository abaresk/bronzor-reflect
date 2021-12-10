interface Coord {
    row: number;
    col: number;
}

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
type Bounce = Coord;

// Destroys a Bronzor
type Destroy = Coord;

// Emitted from the box. A final step.
type Emit = Coord;

// Collides with a Bronzor. A final step.
type Hit = Coord;

type PathStep = | Entry | Bounce | Destroy | Emit | Hit;

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
    bronzors: Array<Bronzor>;
    prizes: Array<PrizeState>;
    history: BoardHistory;
}
