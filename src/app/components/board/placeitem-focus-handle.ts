import { Coord } from "src/app/common/geometry/coord";
import { Direction, isVertical } from "src/app/common/geometry/direction";
import { FocusHandle, NextFocus } from "src/app/common/focus-manager/focus-handle";

export class PlaceItemFocusHandle extends FocusHandle {
    boardLength: number;

    constructor(currentCoord: Coord, boardLength: number) {
        super(currentCoord);

        this.boardLength = boardLength;
    }

    override move(dir: Direction): NextFocus {
        // Wrap around the grid from the border tiles.
        if (dir === Direction.Up && this.currentCoord.row === -1) {
            const nextCoord = new Coord(this.boardLength, this.currentCoord.col);
            return { coord: nextCoord, overflow: dir };
        }
        if (dir === Direction.Down && this.currentCoord.row === this.boardLength) {
            const nextCoord = new Coord(-1, this.currentCoord.col);
            return { coord: nextCoord, overflow: dir };
        }
        if (dir === Direction.Right && this.currentCoord.col === this.boardLength) {
            const nextCoord = new Coord(this.currentCoord.row, -1);
            return { coord: nextCoord, overflow: dir };
        }
        if (dir === Direction.Left && this.currentCoord.col === -1) {
            const nextCoord = new Coord(this.currentCoord.row, this.boardLength);
            return { coord: nextCoord, overflow: dir };
        }

        const delta = (dir === Direction.Right || dir === Direction.Down) ? 1 : -1;
        let newRow = this.currentCoord.row;
        let newCol = this.currentCoord.col;
        if (isVertical(dir)) {
            newRow = this.currentCoord.row + delta;
            // If out of bounds, snap coordinate onto the edge segment.
            if (this.currentCoord.col === -1 || this.currentCoord.col === this.boardLength) {
                if (newRow === -1 || newRow === this.boardLength) {
                    newCol = (newCol === -1) ? 0 : this.boardLength - 1;
                }
            }
        } else {
            newCol = this.currentCoord.col + delta;
            // If out of bounds, snap coordinate onto the edge segment.
            if (this.currentCoord.row === -1 || this.currentCoord.row === this.boardLength) {
                if (newCol === -1 || newCol === this.boardLength) {
                    newRow = (newRow === -1) ? 0 : this.boardLength - 1;
                }
            }
        }

        return { coord: new Coord(newRow, newCol) };
    }

    override enterImpl(dir: Direction): Coord {
        if (isVertical(dir)) {
            const row = (dir === Direction.Down) ? -1 : this.boardLength;
            return new Coord(row, this.currentCoord.col);
        } else {
            const col = (dir === Direction.Right) ? -1 : this.boardLength;
            return new Coord(this.currentCoord.row, col);
        }
    }
}
