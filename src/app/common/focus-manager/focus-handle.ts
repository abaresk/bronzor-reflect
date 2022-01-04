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

    move(dir: Direction): NextFocus { return { coord: this.currentCoord }; }

    // Returns the Coord to focus on when you enter from direction `dir`.
    enter(dir: Direction): Coord {
        this.focused = true;
        return this.enterImpl(dir);
    }

    // Override this method.
    enterImpl(dir: Direction): Coord { return this.currentCoord; }

    leave(): void {
        this.focused = false;
    }
}
