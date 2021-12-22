import { Bronzor } from "./board";
import { jackpotPrize, largeSumPrize, mediumSumPrize, plus1BeamPrize, PrizeState, smallSumPrize, plus3BeamsPrize, minus1BeamPrize, cometBeam, flameBeam, phaseBeam, waterBeam, normalBomb, doublePrizeBeam, prizePayouts, MoneyPrize, jackpotPayouts, Prize, Beam, normalBeam, InventoryPrize } from "./common/prizes";

const prizeDisplays: ReadonlyMap<string, string> = new Map([
    [largeSumPrize.toString(), `$${prizePayouts.get(largeSumPrize.toString())}`],
    [mediumSumPrize.toString(), `$${prizePayouts.get(mediumSumPrize.toString())}`],
    [smallSumPrize.toString(), `$${prizePayouts.get(smallSumPrize.toString())}`],
    [plus1BeamPrize.toString(), '+1 beam'],
    [plus3BeamsPrize.toString(), '+3 beams'],
    [minus1BeamPrize.toString(), '-1 beam'],
    [normalBeam.toString(), 'normal beam'],
    [cometBeam.toString(), 'comet beam'],
    [flameBeam.toString(), 'flame beam'],
    [phaseBeam.toString(), 'shadow beam'],
    [doublePrizeBeam.toString(), 'x2 beam'],
    [waterBeam.toString(), 'water beam'],
    [normalBomb.toString(), 'bomb'],
]);

function getPrizeText(prize: Prize, level: number): string {
    if (prize === MoneyPrize.Jackpot) {
        const payout = jackpotPayouts.get(level) ?? 0;
        return `J ($${payout})`;
    }

    return prizeDisplays.get(prize.toString()) ?? '';
}

export enum SelectionState {
    Unselected,
    Focused,
    Selected,
};

export class Cell {
    visible: boolean;
    interactable: boolean = false;
    selectionState: SelectionState = SelectionState.Unselected;

    constructor(visible: boolean = true) {
        this.visible = visible;
    }

    setVisibility(visible: boolean) {
        this.visible = visible;
    }

    getSelectable(): boolean { return false; }

    setInteractability(interactable: boolean) {
        // Only selectable cells can be made interactive.
        if (!this.getSelectable()) return;

        this.interactable = interactable;
    }

    setSelectionState(state: SelectionState) {
        // You can only set this on selectable cells that are interactable.
        if (!this.getSelectable() || !this.interactable) return;

        this.selectionState = state;
    }

    getText(level: number): string { return ''; }

    getCategory(): string { return ''; }
}

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

        return this.bronzor.visible ? 'B' : '';
    }

    override getCategory(): string {
        return BoardCell.CATEGORY;
    }
}

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

export class IOCell extends Cell {
    static CATEGORY = 'io-cell';
    static SELECTABLE = true;
    // Which beams were fired from this cell.
    inputs: number[];
    // Which beams were emitted from this cell.
    outputs: number[];

    constructor(inputs: number[] = [], outputs: number[] = []) {
        super();
        this.inputs = inputs;
        this.outputs = outputs;
    }

    override getSelectable(): boolean { return IOCell.SELECTABLE; }

    // Get text representation of the cell
    override getText(level: number): string {
        return '';
    }

    override getCategory(): string {
        return IOCell.CATEGORY;
    }
}

export class InventoryCell extends Cell {
    static CATEGORY = 'inventory-cell';
    static SELECTABLE = true;
    item: Beam;// The item this corresponds to
    count: number; // Current stock for item

    constructor(item: Beam, count: number = 0) {
        super();
        this.item = item;
        this.count = count;
    }

    override getSelectable(): boolean { return InventoryCell.SELECTABLE; }

    // Get text representation of the cell
    override getText(level: number): string {
        const itemName = getPrizeText(this.item, level);
        return `${itemName}: ${this.count}`;
    }

    override getCategory(): string {
        return InventoryCell.CATEGORY;
    }
}
