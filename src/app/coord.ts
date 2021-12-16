/**
 * Coordinates
 */

class Coord {
    row: number;
    col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    coordAt(dir: Direction, spaces: number): Coord {
        switch (dir) {
            case Direction.Up:
                return new Coord(this.row - spaces, this.col);
            case Direction.Right:
                return new Coord(this.row, this.col + spaces);
            case Direction.Down:
                return new Coord(this.row + spaces, this.col);
            case Direction.Left:
                return new Coord(this.row, this.col - spaces);
        }
    }
}

enum Direction {
    Up,
    Right,
    Down,
    Left,
}

const directions = [
    Direction.Up,
    Direction.Right,
    Direction.Down,
    Direction.Left
] as const;

interface Vector {
    coord: Coord;
    dir: Direction;
}

enum Orientation {
    Vertical,
    Horizontal,
}

function toOrientation(dir: Direction): Orientation {
    switch (dir) {
        case Direction.Up:
        // fallthrough
        case Direction.Down:
            return Orientation.Vertical;
        case Direction.Right:
        // fallthrough
        case Direction.Left:
            return Orientation.Horizontal;
    }
}

function rotateClockwise(dir: Direction, turns: number): Direction {
    const idx = directions.indexOf(dir);
    return directions[(idx + turns) % 4]
}

function oppositeDir(dir: Direction): Direction {
    return rotateClockwise(dir, 2);
}

// True if you can reach `coord2` from `coord1` by traveling straight in
// direction `dir`.
function coordInDirection(coord1: Coord, coord2: Coord, dir: Direction): boolean {
    const sameCol = coord1.col === coord2.col;
    const sameRow = coord1.row === coord2.row;

    switch (dir) {
        case Direction.Up:
            return sameCol && coord2.row < coord1.row;
        case Direction.Right:
            return sameRow && coord2.col > coord1.col;
        case Direction.Down:
            return sameCol && coord2.row > coord1.row;
        case Direction.Left:
            return sameRow && coord2.col < coord1.col;
    }
}

// Distance from `coord1` to `coord2` in direction `dir`. They do not 
// necessarily need to be aligned on the same axis.
function distanceInDirection(coord1: Coord, coord2: Coord, dir: Direction): number {
    switch (dir) {
        case Direction.Up:
            return coord1.row - coord2.row;
        case Direction.Right:
            return coord2.col - coord1.col;
        case Direction.Down:
            return coord2.row - coord1.row;
        case Direction.Left:
            return coord1.col - coord2.col;
    }
}

// The Coord when you move from `coord1` in direction `dir` until you reach
// `coord2`. If `coord2` is in the opposite direction, returns `coord1`.
function projectToCoord(vector: Vector, coord2: Coord): Coord {
    const distance = distanceInDirection(vector.coord, coord2, vector.dir);
    if (distance < 0) return vector.coord;

    return vector.coord.coordAt(vector.dir, distance);
}

export {
    coordInDirection,
    directions,
    distanceInDirection,
    oppositeDir,
    projectToCoord,
    rotateClockwise,
    Coord,
    Direction,
    Orientation,
    Vector,
};
