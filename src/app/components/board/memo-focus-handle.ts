import { Coord } from "src/app/common/geometry/coord";
import { Direction, isVertical } from "src/app/common/geometry/direction";
import { FocusHandle, NextFocus } from "src/app/common/focus-manager/focus-handle";

export class MemoFocusHandle extends FocusHandle {
    boardLength: number;

    constructor(currentCoord: Coord, boardLength: number) {
        super(currentCoord);

        this.boardLength = boardLength;
    }

    override move(dir: Direction): NextFocus {
        const delta = (dir === Direction.Right || dir === Direction.Down) ?
            1 : -1;

        const nextCoord = this.currentCoord.coordAt(dir, 1);

        if (nextCoord.row < 0) {
            return { coord: nextCoord, overflow: Direction.Up };
        }
        if (nextCoord.row >= this.boardLength) {
            return { coord: nextCoord, overflow: Direction.Down };
        }
        if (nextCoord.col < 0) {
            return { coord: nextCoord, overflow: Direction.Left };
        }
        if (nextCoord.col >= this.boardLength) {
            return { coord: nextCoord, overflow: Direction.Right };
        }

        return { coord: nextCoord };
    }

    override enterImpl(dir: Direction): Coord {
        if (isVertical(dir)) {
            const row = (dir === Direction.Down) ? 0 : this.boardLength - 1;
            return new Coord(row, this.currentCoord.col);
        } else {
            const col = (dir === Direction.Right) ? 0 : this.boardLength - 1;
            return new Coord(this.currentCoord.row, col);
        }
    }
}
