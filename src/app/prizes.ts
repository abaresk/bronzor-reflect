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

export const jackpotPrize: MoneyPrize = { type: MoneyPrizeType.Jackpot };
export const largeSumPrize: MoneyPrize = { type: MoneyPrizeType.LargeSum };
export const mediumSumPrize: MoneyPrize = { type: MoneyPrizeType.MediumSum };
export const smallSumPrize: MoneyPrize = { type: MoneyPrizeType.SmallSum };
export const plus1BeamPrize: InventoryPrize = { type: InventoryPrizeType.Plus1Beam };
export const plus3BeamsPrize: InventoryPrize = { type: InventoryPrizeType.Plus3Beams };
export const minus1BeamPrize: InventoryPrize = { type: InventoryPrizeType.Minus1Beam };
export const cometBeamPrize: BeamPrize = { type: Beam.Comet };
export const flameBeamPrize: BeamPrize = { type: Beam.Flame };
export const phaseBeamPrize: BeamPrize = { type: Beam.Phase };
export const doublePrizePrize: BeamPrize = { type: Beam.DoublePrize };
export const waterBeamPrize: BeamPrize = { type: Beam.Water };
export const normalBombPrize: BombPrize = { type: BombType.Normal };

export type Prize = | MoneyPrize | InventoryPrize | BeamPrize | BombPrize;

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
    doublePrizePrize,
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

export const moneyPrizePayouts: ReadonlyMap<MoneyPrize, number> = new Map([
    [largeSumPrize, 20],
    [mediumSumPrize, 10],
    [smallSumPrize, 3],
]);

export const inventoryPrizePayouts: ReadonlyMap<InventoryPrize, number> = new Map([
    [plus1BeamPrize, 1],
    [plus3BeamsPrize, 3],
    [minus1BeamPrize, -1],
]);

export const beamPrizePayouts: ReadonlyMap<BeamPrize, number> = new Map([
    [cometBeamPrize, 1],
    [flameBeamPrize, 1],
    [phaseBeamPrize, 1],
    [doublePrizePrize, 1],
    [waterBeamPrize, 1],
]);

export interface PrizeState {
    prize: Prize;
    taken: boolean;
}
