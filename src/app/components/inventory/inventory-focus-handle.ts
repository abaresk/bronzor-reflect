import { Coord } from "src/app/common/geometry/coord";
import { Direction, isVertical } from "src/app/common/geometry/direction";
import { FocusHandle, NextFocus } from "src/app/services/focus-manager/focus-handle";

export class InventoryFocusHandle extends FocusHandle {
  width: number;
  height: number;

  constructor(currentCoord: Coord, width: number, height: number) {
    super(currentCoord);

    this.width = width;
    this.height = height;
  }

  override move(dir: Direction): NextFocus {
    const nextCoord = this.currentCoord.coordAt(dir, 1);

    if (nextCoord.row < 0) {
      return { coord: nextCoord, overflow: Direction.Up };
    }
    if (nextCoord.row >= this.width) {
      return { coord: nextCoord, overflow: Direction.Down };
    }
    if (nextCoord.col < 0) {
      return { coord: nextCoord, overflow: Direction.Left };
    }
    if (nextCoord.col >= this.height) {
      return { coord: nextCoord, overflow: Direction.Right };
    }

    return { coord: nextCoord };
  }

  override enterImpl(dir: Direction): Coord {
    if (isVertical(dir)) {
      const row = (dir === Direction.Down) ? 0 : this.height - 1;
      return new Coord(row, this.currentCoord.col);
    } else {
      const col = (dir === Direction.Right) ? 0 : this.width - 1;
      return new Coord(this.currentCoord.row, col);
    }
  }
}
