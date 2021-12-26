import { Cell } from "src/app/common/cell";
import { Coord } from "src/app/common/coord";

export class IOCell extends Cell {
    static CATEGORY = 'io-cell';
    static SELECTABLE = true;
    coord: Coord;
    // Which beams were fired from this cell.
    inputs: number[];
    // Which beams were emitted from this cell.
    outputs: number[];
    validateSelection?: (coord: Coord) => boolean;

    constructor(coord: Coord, validateSelection: (coord: Coord) => boolean, inputs: number[] = [], outputs: number[] = []) {
        super();
        this.coord = coord;
        this.inputs = inputs;
        this.outputs = outputs;
        this.validateSelection = validateSelection;
    }

    override getSelectable(): boolean { return IOCell.SELECTABLE; }

    override validSelection(): boolean {
        if (!this.validateSelection) return false;

        return this.validateSelection(this.coord);
    }

    // Get text representation of the cell
    override getText(level: number): string {
        return '';
    }

    override getCategory(): string {
        return IOCell.CATEGORY;
    }
}

