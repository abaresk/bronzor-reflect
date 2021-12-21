export enum MoneyPrize {
    Jackpot = 'MoneyPrize.Jackpot',
    LargeSum = 'MoneyPrize.LargeSum',
    MediumSum = 'MoneyPrize.Medium',
    SmallSum = 'MoneyPrize.SmallSum',
}

export enum InventoryPrize {
    Plus1Beam = 'InventoryPrize.Plus1Beam',
    Plus3Beams = 'InventoryPrize.Plus3Beams',
    Minus1Beam = 'InventoryPrize.Minus1Beam',
}

export enum Beam {
    Normal = 'Beam.Normal',
    Comet = 'Beam.Comet',
    Flame = 'Beam.Flame',
    Phase = 'Beam.Phase',
    DoublePrize = 'Beam.DoublePrize',
    Water = 'Beam.Water',
}

export enum Bomb {
    Normal = 'Bomb.Normal',
}

export type Prize = MoneyPrize | InventoryPrize | Beam | Bomb;

export interface PrizeDictionary<T> {
    [key: string]: T;
};

export type PrizeCategory = string;

export function getCategory(prize: Prize): PrizeCategory {
    if (Object.values(MoneyPrize).includes(prize as MoneyPrize)) {
        return 'moneyprize';
    } else if (Object.values(InventoryPrize).includes(prize as InventoryPrize)) {
        return 'inventoryprize';
    } else if (Object.values(Beam).includes(prize as Beam)) {
        return 'beamprize';
    } else if (Object.values(Bomb).includes(prize as Bomb)) {
        return 'bombprize';
    }
    return '';
}

export const jackpotPrize = MoneyPrize.Jackpot;
export const largeSumPrize = MoneyPrize.LargeSum;
export const mediumSumPrize = MoneyPrize.MediumSum;
export const smallSumPrize = MoneyPrize.SmallSum;
export const plus1BeamPrize = InventoryPrize.Plus1Beam;
export const plus3BeamsPrize = InventoryPrize.Plus3Beams;
export const minus1BeamPrize = InventoryPrize.Minus1Beam;
export const cometBeamPrize = Beam.Comet;
export const flameBeamPrize = Beam.Flame;
export const phaseBeamPrize = Beam.Phase;
export const doublePrizeBeamPrize = Beam.DoublePrize;
export const waterBeamPrize = Beam.Water;
export const normalBombPrize = Bomb.Normal;

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
    [minus1BeamPrize.toString(), - 1],
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
