import { Cell } from "src/app/common/cell";
import { getPrizeText, PrizeState } from "src/app/common/prizes";

export class PrizeCell extends Cell {
    static CATEGORY = 'prize-cell';
    static SELECTABLE = false;
    // PrizeState or `undefined` if the cell doesn't have a prize.
    prizeState: PrizeState | undefined;

    constructor(prizeState: PrizeState | undefined) {
        super();
        this.prizeState = prizeState;
    }

    override getSelectable(): boolean { return PrizeCell.SELECTABLE; }

    // Get text representation of the cell
    override getText(level: number): string {
        if (!this.prizeState) return '';

        const taken = this.prizeState.taken ? 'taken' : '';
        const prizeName = getPrizeText(this.prizeState.prize, level);
        return taken ? `${prizeName}\n${taken}` : `${prizeName}`;
    }

    override getCategory(): string {
        return PrizeCell.CATEGORY;
    }
}
