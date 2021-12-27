import { Coord, coordInDirection, distanceInDirection, Vector } from "./coord";

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

