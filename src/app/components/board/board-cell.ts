import { Bronzor } from "src/app/board";
import { Cell } from "src/app/common/cell";

export class BoardCell extends Cell {
    static CATEGORY = 'board-cell';
    static SELECTABLE = false;
    bronzor: Bronzor | undefined;
    revealHidden: boolean = false;

    constructor(bronzor: Bronzor | undefined) {
        super();
        this.bronzor = bronzor;
    }

    override getSelectable(): boolean { return BoardCell.SELECTABLE; }

    // Get text representation of the cell
    override getText(level: number): string {
        if (!this.bronzor) return '';

        if (this.bronzor.visible) return 'B';
        return this.revealHidden ? 'H' : '';
    }

    override getCategory(): string {
        return BoardCell.CATEGORY;
    }

    setRevealHidden(value: boolean): void {
        this.revealHidden = value;
    }
}
