import { Beam, cometBeam, doublePrizeBeam, flameBeam, flashCannonBeam, psyBeam, shadowBeam, waterBeam } from "./beams";

export enum MoneyPrize {
    Jackpot = 'MoneyPrize.Jackpot',
    LargeSum = 'MoneyPrize.LargeSum',
    MediumSum = 'MoneyPrize.Medium',
    SmallSum = 'MoneyPrize.SmallSum',
}

export enum InventoryPrize {
    Plus3Beams = 'InventoryPrize.Plus3Beams',
    Plus5Beams = 'InventoryPrize.Plus5Beams',
    Minus1Beam = 'InventoryPrize.Minus1Beam',
}

export enum Bomb {
    Normal = 'Bomb.Normal',
}

export type Prize = MoneyPrize | InventoryPrize | Beam | Bomb;

// Items that appear as prizes
export const jackpotPrize = MoneyPrize.Jackpot;
export const largeSumPrize = MoneyPrize.LargeSum;
export const mediumSumPrize = MoneyPrize.MediumSum;
export const smallSumPrize = MoneyPrize.SmallSum;
export const plus3BeamsPrize = InventoryPrize.Plus3Beams;
export const plus5BeamsPrize = InventoryPrize.Plus5Beams;
export const minus1BeamPrize = InventoryPrize.Minus1Beam;
export const normalBomb = Bomb.Normal;

export const prizes: ReadonlyArray<Prize> = [
    jackpotPrize,
    largeSumPrize,
    mediumSumPrize,
    smallSumPrize,
    plus3BeamsPrize,
    plus5BeamsPrize,
    minus1BeamPrize,
    cometBeam,
    flameBeam,
    flashCannonBeam,
    shadowBeam,
    psyBeam,
    doublePrizeBeam,
    waterBeam,
    normalBomb,
];

// Jackpot payout by level
export function jackpotPayout(jackpotsCollected: number): number {
    return 20 * Math.pow(2, jackpotsCollected);
}

export const prizePayouts: ReadonlyMap<string, number> = new Map([
    [largeSumPrize.toString(), 10],
    [mediumSumPrize.toString(), 5],
    [smallSumPrize.toString(), 3],
    [plus3BeamsPrize.toString(), 3],
    [plus5BeamsPrize.toString(), 5],
    [minus1BeamPrize.toString(), - 1],
    [cometBeam.toString(), 1],
    [flameBeam.toString(), 1],
    [flashCannonBeam.toString(), 1],
    [shadowBeam.toString(), 1],
    [psyBeam.toString(), 1],
    [doublePrizeBeam.toString(), 1],
    [waterBeam.toString(), 1],
    [normalBomb.toString(), 1],
]);

export const negativePrizes: ReadonlySet<Prize> = new Set([
    minus1BeamPrize,
    normalBomb,
]);
