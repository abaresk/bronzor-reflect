export interface MoneyPrize {
    type: MoneyPrizeType;
}

export enum MoneyPrizeType {
    Jackpot,
    LargeSum,
    MediumSum,
    SmallSum,
}

export interface InventoryPrize {
    type: InventoryPrizeType;
}

export enum InventoryPrizeType {
    Plus1Beam,
    Plus3Beams,
    Minus1Beam,
}

export interface BeamPrize {
    type: Beam;
}

export enum Beam {
    Normal,
    Comet,
    Flame,
    Phase,
    DoublePrize,
    Water,
}

export interface BombPrize {
    type: BombType;
}

export enum BombType {
    Normal,
};

export class Prize {
    toString() { return ''; }
}

export class MoneyPrize extends Prize {
    type: MoneyPrizeType;

    constructor(type: MoneyPrizeType) {
        super();
        this.type = type;
    }

    override toString(): string {
        return `moneyprize-${this.type}`;
    }
}

export class InventoryPrize extends Prize {
    type: InventoryPrizeType;

    constructor(type: InventoryPrizeType) {
        super();
        this.type = type;
    }

    override toString(): string {
        return `inventoryprize-${this.type}`;
    }
}

export class BeamPrize extends Prize {
    type: Beam;

    constructor(type: Beam) {
        super();
        this.type = type;
    }

    override toString(): string {
        return `beamprize-${this.type}`;
    }
}

export class BombPrize extends Prize {
    type: BombType;

    constructor(type: BombType) {
        super();
        this.type = type;
    }

    override toString(): string {
        return `bombprize-${this.type}`;
    }
}

export const jackpotPrize = new MoneyPrize(MoneyPrizeType.Jackpot);
export const largeSumPrize = new MoneyPrize(MoneyPrizeType.LargeSum);
export const mediumSumPrize = new MoneyPrize(MoneyPrizeType.MediumSum);
export const smallSumPrize = new MoneyPrize(MoneyPrizeType.SmallSum);
export const plus1BeamPrize = new InventoryPrize(InventoryPrizeType.Plus1Beam);
export const plus3BeamsPrize = new InventoryPrize(InventoryPrizeType.Plus3Beams);
export const minus1BeamPrize = new InventoryPrize(InventoryPrizeType.Minus1Beam);
export const cometBeamPrize = new BeamPrize(Beam.Comet);
export const flameBeamPrize = new BeamPrize(Beam.Flame);
export const phaseBeamPrize = new BeamPrize(Beam.Phase);
export const doublePrizeBeamPrize = new BeamPrize(Beam.DoublePrize);
export const waterBeamPrize = new BeamPrize(Beam.Water);
export const normalBombPrize = new BombPrize(BombType.Normal);

export const prizes: ReadonlyArray<Prize> = [
    jackpotPrize,
    largeSumPrize,
    mediumSumPrize,
    smallSumPrize,
    plus1BeamPrize,
    plus3BeamsPrize,
    minus1BeamPrize,
    cometBeamPrize,
    flameBeamPrize,
    phaseBeamPrize,
    doublePrizeBeamPrize,
    waterBeamPrize,
    normalBombPrize,
];

// Jackpot payout by level
export const jackpotPayouts: ReadonlyMap<number, number> = new Map([
    [1, 30],
    [2, 50],
    [3, 80],
    [4, 120],
    [5, 180],
    [6, 280],
    [7, 400],
    [8, 600],
]);

export const prizePayouts: ReadonlyMap<string, number> = new Map([
    [largeSumPrize.toString(), 20],
    [mediumSumPrize.toString(), 10],
    [smallSumPrize.toString(), 3],
    [plus1BeamPrize.toString(), 1],
    [plus3BeamsPrize.toString(), 3],
    [minus1BeamPrize.toString(), -1],
    [cometBeamPrize.toString(), 1],
    [flameBeamPrize.toString(), 1],
    [phaseBeamPrize.toString(), 1],
    [doublePrizeBeamPrize.toString(), 1],
    [waterBeamPrize.toString(), 1],
    [normalBombPrize.toString(), 1],
]);

export interface PrizeState {
    prize: Prize;
    taken: boolean;
}
