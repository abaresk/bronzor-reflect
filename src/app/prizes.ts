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
    if (prize in MoneyPrize) {
        return 'moneyprize';
    } else if (prize in InventoryPrize) {
        return 'inventoryprize';
    } else if (prize in Beam) {
        return 'beamprize';
    } else if (prize in Bomb) {
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

export const prizePayouts: PrizeDictionary<number> = {
    largeSumPrize: 20,
    mediumSumPrize: 10,
    smallSumPrize: 3,
    plus1BeamPrize: 1,
    plus3BeamsPrize: 3,
    minus1BeamPrize: - 1,
    cometBeamPrize: 1,
    flameBeamPrize: 1,
    phaseBeamPrize: 1,
    doublePrizeBeamPrize: 1,
    waterBeamPrize: 1,
    normalBombPrize: 1,
};

export interface PrizeState {
    prize: Prize;
    taken: boolean;
}
