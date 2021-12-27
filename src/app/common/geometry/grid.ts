import { Coord } from "./coord";
import { Direction, directions, rotateClockwise } from "./direction";
import { LineSegment } from "./line-segment";

export class Grid {
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

    // Returns the direction of the edge segment if found, else undefined.
    coordInEdgeSegments(coord: Coord, radius: number): Direction | undefined {
        const segments = this.edgeSegments(radius);
        for (let i = 0; i < directions.length; i++) {
            if (segments[i].contains(coord)) return directions[i];
        }
        return undefined;
    }

    private rowOverlaps(coord: Coord): boolean {
        return coord.row >= 0 && coord.row < this.height;
    }

    private colOverlaps(coord: Coord): boolean {
        return coord.col >= 0 && coord.col < this.width;
    }
}
