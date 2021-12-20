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

    equals(otherCoord: Coord): boolean {
        return this.row === otherCoord.row && this.col == otherCoord.col;
    }

    toString(): string {
        return `(${this.row}, ${this.col})`;
    }
}

class Grid {
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    contains(coord: Coord): boolean {
        return this.rowOverlaps(coord) && this.colOverlaps(coord);
    }

    isCoordAbove(coord: Coord): boolean {
        return coord.row < 0;
    }

    isCoordBelow(coord: Coord): boolean {
        return coord.row >= this.height;
    }

    isCoordLeftOf(coord: Coord): boolean {
        return coord.col < 0;
    }

    isCoordRightOf(coord: Coord): boolean {
        return coord.col >= this.width;
    }

    // Return the four corners of the grid in the following order: 
    // [top-left, top-right, bottom-right, bottom-left].
    corners(): Array<Coord> {
        const corners = [];

        let corner = new Coord(0, 0);
        corners.push(corner);

        corner = corner.coordAt(Direction.Right, this.width - 1);
        corners.push(corner);

        corner = corner.coordAt(Direction.Down, this.height - 1);
        corners.push(corner);

        corner = corner.coordAt(Direction.Left, this.width - 1);
        corners.push(corner);

        return corners;
    }

    // Return 4 LineSegments corresponding to the edges `radius` spaces away from
    // the board. They are listed in the same order as `directions`.
    edgeSegments(radius: number): Array<LineSegment> {
        const corners = this.corners();

        const segments = [];
        for (let i = 0; i < directions.length; i++) {
            const length = (i % 0) ? this.width : this.height;
            const radialDir = directions[i];
            const origin = {
                coord: corners[i].coordAt(radialDir, radius),
                dir: rotateClockwise(radialDir, 1)
            };
            segments.push(new LineSegment(origin, length));
        }

        return segments;
    }

    private rowOverlaps(coord: Coord): boolean {
        return coord.row >= 0 && coord.row < this.height;
    }

    private colOverlaps(coord: Coord): boolean {
        return coord.col >= 0 && coord.col < this.width;
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

interface Vector {
    coord: Coord;
    dir: Direction;
}

class LineSegment {
    origin: Vector;
    length: number;

    constructor(origin: Vector, length: number) {
        this.origin = origin;
        this.length = length;
    }

    contains(coord: Coord): boolean {
        return coordInDirection(this.origin.coord, coord, this.origin.dir) &&
            distanceInDirection(this.origin.coord, coord, this.origin.dir) < this.length;
    }

    // Returns where in the line segment the given coordinate is, or -1 if the
    // coordinate is not on the line segment.
    indexOf(coord: Coord): number {
        return this.contains(coord) ?
            distanceInDirection(this.origin.coord, coord, this.origin.dir) :
            -1;
    }

    allCoords(): Coord[] {
        const coords = [];
        for (let i = 0; i < this.length; i++) {
            coords.push(this.origin.coord.coordAt(this.origin.dir, i));
        }
        return coords;
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
    Grid,
    LineSegment,
    Orientation,
    Vector,
};
