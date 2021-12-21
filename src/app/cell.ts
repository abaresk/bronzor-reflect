import { Bronzor } from "./board";
import { jackpotPrize, largeSumPrize, mediumSumPrize, plus1BeamPrize, PrizeState, smallSumPrize, plus3BeamsPrize, minus1BeamPrize, cometBeamPrize, flameBeamPrize, phaseBeamPrize, waterBeamPrize, normalBombPrize, doublePrizeBeamPrize, prizePayouts } from "./common/prizes";

const prizeDisplays: ReadonlyMap<string, string> = new Map([
    [jackpotPrize.toString(), 'J'],
    [largeSumPrize.toString(), `$${prizePayouts[largeSumPrize]}`],
    [mediumSumPrize.toString(), `$${prizePayouts[mediumSumPrize]}`],
    [smallSumPrize.toString(), `$${prizePayouts[smallSumPrize]}`],
    [plus1BeamPrize.toString(), '+1 beam'],
    [plus3BeamsPrize.toString(), '+3 beams'],
    [minus1BeamPrize.toString(), '-1 beam'],
    [cometBeamPrize.toString(), 'comet beam'],
    [flameBeamPrize.toString(), 'flame beam'],
    [phaseBeamPrize.toString(), 'shadow beam'],
    [doublePrizeBeamPrize.toString(), 'x2 beam'],
    [waterBeamPrize.toString(), 'water beam'],
    [normalBombPrize.toString(), 'bomb'],
]);

export class Cell {
    visible: boolean;

    constructor(visible: boolean = true) {
        this.visible = visible;
    }

    setVisibility(visible: boolean) {
        this.visible = visible;
    }

    getText(): string { return ''; }
}

export class BoardCell extends Cell {
    bronzor: Bronzor | undefined;

    constructor(bronzor: Bronzor | undefined) {
        super();
        this.bronzor = bronzor;
    }

    // Get text representation of the cell
    override getText(): string {
        if (!this.bronzor) return '';

        return this.bronzor.visible ? 'B' : '';
    }
}

export class PrizeCell extends Cell {
    // PrizeState or `undefined` if the cell doesn't have a prize.
    prizeState: PrizeState | undefined;

    constructor(prizeState: PrizeState | undefined) {
        super();
        this.prizeState = prizeState;
    }

    // Get text representation of the cell
    override getText(): string {
        if (!this.prizeState) return '';

        const taken = this.prizeState.taken ? 'taken' : '';
        const prizeName = prizeDisplays.get(this.prizeState.prize.toString());
        return taken ? `${prizeName}\n${taken}` : `${prizeName}`;
    }
}

export class IOCell extends Cell {
    // Which beams were fired from this cell.
    inputs: number[];
    // Which beams were emitted from this cell.
    outputs: number[];

    constructor(inputs: number[] = [], outputs: number[] = []) {
        super();
        this.inputs = inputs;
        this.outputs = outputs;
    }

    // Get text representation of the cell
    override getText(): string {
        return '';
    }
}
