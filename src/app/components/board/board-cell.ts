import { Bronzor } from "src/app/board";
import { Cell } from "src/app/common/cell";

export class BoardCell extends Cell {
    static CATEGORY = 'board-cell';
    static SELECTABLE = false;
    bronzor: Bronzor | undefined;

    constructor(bronzor: Bronzor | undefined) {
        super();
        this.bronzor = bronzor;
    }

    override getSelectable(): boolean { return BoardCell.SELECTABLE; }

    // Get text representation of the cell
    override getText(level: number): string {
        if (!this.bronzor) return '';

        return this.bronzor.visible ? 'B' : 'H';
    }

    override getCategory(): string {
        return BoardCell.CATEGORY;
    }
}
