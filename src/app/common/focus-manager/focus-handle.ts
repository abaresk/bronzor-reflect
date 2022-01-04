import { Coord } from "src/app/common/geometry/coord";
import { Direction } from "src/app/common/geometry/direction";

export interface NextFocus {
    coord: Coord;
    overflow?: Direction;
};

export abstract class FocusHandle {
    currentCoord: Coord;
    focused: boolean = false;

    constructor(initialCoord: Coord) {
        this.currentCoord = initialCoord;
    }

    abstract move(dir: Direction): NextFocus;

    // Set the focused Coord when you enter this handle from direction `dir`.
    enter(dir: Direction): void {
        this.setFocus(this.enterImpl(dir));
    }

    abstract enterImpl(dir: Direction): Coord;

    leave(): void {
        this.focused = false;
    }

    setFocus(coord: Coord): void {
        this.focused = true;
        this.currentCoord = coord;
    }
}
