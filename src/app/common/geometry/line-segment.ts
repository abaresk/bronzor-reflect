import { Coord, coordInDirection, distanceInDirection } from "./coord";
import { Vector } from "./vector";

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

    at(index: number): Coord | undefined {
        if (index < 0 || index >= this.length) return undefined;

        return this.allCoords()[index];
    }

    allCoords(): Coord[] {
        const coords = [];
        for (let i = 0; i < this.length; i++) {
            coords.push(this.origin.coord.coordAt(this.origin.dir, i));
        }
        return coords;
    }
}

