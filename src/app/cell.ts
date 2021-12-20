import { Bronzor } from "./board";
import { jackpotPrize, largeSumPrize, mediumSumPrize, moneyPrizePayouts, plus1BeamPrize, MoneyPrize, PrizeState, smallSumPrize, InventoryPrize, plus3BeamsPrize, minus1BeamPrize, BeamPrize, cometBeamPrize, flameBeamPrize, phaseBeamPrize, doublePrizePrize, waterBeamPrize, BombPrize, normalBombPrize } from "./items";

const moneyPrizeDisplays: ReadonlyMap<MoneyPrize, string> = new Map([
    [jackpotPrize, 'J'],
    [largeSumPrize, `$${moneyPrizePayouts.get(largeSumPrize)}`],
    [mediumSumPrize, `$${moneyPrizePayouts.get(mediumSumPrize)}`],
    [smallSumPrize, `$${moneyPrizePayouts.get(smallSumPrize)}`],
]);

const inventoryPrizeDisplays: ReadonlyMap<InventoryPrize, string> = new Map([
    [plus1BeamPrize, '+1 beam'],
    [plus3BeamsPrize, '+3 beams'],
    [minus1BeamPrize, '-1 beam'],
]);

const beamPrizeDisplays: ReadonlyMap<BeamPrize, string> = new Map([
    [cometBeamPrize, 'comet beam'],
    [flameBeamPrize, 'flame beam'],
    [phaseBeamPrize, 'shadow beam'],
    [doublePrizePrize, 'x2 beam'],
    [waterBeamPrize, 'water beam'],
]);

const bombPrizeDisplays: ReadonlyMap<BombPrize, string> = new Map([
    [normalBombPrize, 'bomb'],
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
        let prizeName = '';
        if (this.prizeState.prize as MoneyPrize) {
            const moneyPrize = this.prizeState.prize as MoneyPrize;
            prizeName = moneyPrizeDisplays.get(moneyPrize) ?? '';
        }
        else if (this.prizeState.prize as InventoryPrize) {
            const inventoryPrize = this.prizeState.prize as InventoryPrize;
            prizeName = inventoryPrizeDisplays.get(inventoryPrize) ?? '';
        }
        else if (this.prizeState.prize as BeamPrize) {
            const beamPrize = this.prizeState.prize as BeamPrize;
            prizeName = beamPrizeDisplays.get(beamPrize) ?? '';
        }
        else if (this.prizeState.prize as BombPrize) {
            const bombPrize = this.prizeState.prize as BombPrize;
            prizeName = bombPrizeDisplays.get(bombPrize) ?? '';
        }

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
