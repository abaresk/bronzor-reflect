import { Direction } from "./direction";

export class Coord {
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

    static fromString(coordString: string): Coord {
        let noParens = coordString.substring(1);
        noParens = noParens.substring(0, noParens.length - 1);
        const split = noParens.split(',');
        return new Coord(Number(split[0]), Number(split[1]));
    }
}

export interface Vector {
    coord: Coord;
    dir: Direction;
}

export class LineSegment {
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

// True if you can reach `coord2` from `coord1` by traveling straight in
// direction `dir`.
export function coordInDirection(coord1: Coord, coord2: Coord, dir: Direction): boolean {
    const sameCol = coord1.col === coord2.col;
    const sameRow = coord1.row === coord2.row;

    switch (dir) {
        case Direction.Up:
            return sameCol && coord2.row <= coord1.row;
        case Direction.Right:
            return sameRow && coord2.col >= coord1.col;
        case Direction.Down:
            return sameCol && coord2.row >= coord1.row;
        case Direction.Left:
            return sameRow && coord2.col <= coord1.col;
    }
}

// Distance from `coord1` to `coord2` in direction `dir`. They do not 
// necessarily need to be aligned on the same axis.
export function distanceInDirection(coord1: Coord, coord2: Coord, dir: Direction): number {
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
export function projectToCoord(vector: Vector, coord2: Coord): Coord {
    const distance = distanceInDirection(vector.coord, coord2, vector.dir);
    if (distance < 0) return vector.coord;

    return vector.coord.coordAt(vector.dir, distance);
}
