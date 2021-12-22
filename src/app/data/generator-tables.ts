import { Beam, Bomb, cometBeam, doublePrizeBeam, flameBeam, InventoryPrize, jackpotPrize, largeSumPrize, mediumSumPrize, minus1BeamPrize, MoneyPrize, normalBomb, phaseBeam, plus1BeamPrize, plus3BeamsPrize, Prize, PrizeDictionary, prizes, smallSumPrize, waterBeam } from "../common/prizes";

interface Range {
    min: number; // inclusive
    max: number; // inclusive
};

type LevelYield = ReadonlyMap<number, Range>;

// Always 1 Jackpot per round
const jackpotsByLevel: LevelYield = new Map([
    [1, { min: 1, max: 1 }],
    [2, { min: 1, max: 1 }],
    [3, { min: 1, max: 1 }],
    [4, { min: 1, max: 1 }],
    [5, { min: 1, max: 1 }],
    [6, { min: 1, max: 1 }],
    [7, { min: 1, max: 1 }],
    [8, { min: 1, max: 1 }],
]);

const largeSumsByLevel: LevelYield = new Map([
    [1, { min: 1, max: 1 }],
    [2, { min: 1, max: 1 }],
    [3, { min: 1, max: 2 }],
    [4, { min: 1, max: 2 }],
    [5, { min: 1, max: 2 }],
    [6, { min: 2, max: 3 }],
    [7, { min: 2, max: 3 }],
    [8, { min: 2, max: 4 }],
]);

const mediumSumsByLevel: LevelYield = new Map([
    [1, { min: 1, max: 3 }],
    [2, { min: 1, max: 3 }],
    [3, { min: 2, max: 4 }],
    [4, { min: 2, max: 4 }],
    [5, { min: 3, max: 5 }],
    [6, { min: 3, max: 5 }],
    [7, { min: 4, max: 6 }],
    [8, { min: 4, max: 6 }],
]);

const smallSumsByLevel: LevelYield = new Map([
    [1, { min: 3, max: 5 }],
    [2, { min: 3, max: 5 }],
    [3, { min: 3, max: 5 }],
    [4, { min: 4, max: 6 }],
    [5, { min: 4, max: 6 }],
    [6, { min: 4, max: 6 }],
    [7, { min: 4, max: 7 }],
    [8, { min: 4, max: 7 }],
]);

const plus1BeamsByLevel: LevelYield = new Map([
    [1, { min: 0, max: 1 }],
    [2, { min: 0, max: 1 }],
    [3, { min: 0, max: 1 }],
    [4, { min: 0, max: 2 }],
    [5, { min: 0, max: 2 }],
    [6, { min: 0, max: 3 }],
    [7, { min: 1, max: 4 }],
    [8, { min: 1, max: 4 }],
]);

const plus3BeamsByLevel: LevelYield = new Map([
    [1, { min: 0, max: 0 }],
    [2, { min: 0, max: 0 }],
    [3, { min: 0, max: 0 }],
    [4, { min: 0, max: 1 }],
    [5, { min: 0, max: 1 }],
    [6, { min: 0, max: 1 }],
    [7, { min: 0, max: 2 }],
    [8, { min: 0, max: 2 }],
]);

const minus1BeamsByLevel: LevelYield = new Map([
    [1, { min: 0, max: 0 }],
    [2, { min: 0, max: 0 }],
    [3, { min: 0, max: 1 }],
    [4, { min: 0, max: 1 }],
    [5, { min: 0, max: 1 }],
    [6, { min: 0, max: 1 }],
    [7, { min: 0, max: 2 }],
    [8, { min: 0, max: 2 }],
]);

const cometBeamsByLevel: LevelYield = new Map([
    [1, { min: 0, max: 0 }],
    [2, { min: 0, max: 0 }],
    [3, { min: 0, max: 0 }],
    [4, { min: 0, max: 1 }],
    [5, { min: 0, max: 1 }],
    [6, { min: 0, max: 1 }],
    [7, { min: 0, max: 2 }],
    [8, { min: 0, max: 2 }],
]);

const flameBeamsByLevel: LevelYield = new Map([
    [1, { min: 0, max: 0 }],
    [2, { min: 0, max: 0 }],
    [3, { min: 0, max: 1 }],
    [4, { min: 0, max: 1 }],
    [5, { min: 0, max: 2 }],
    [6, { min: 0, max: 2 }],
    [7, { min: 0, max: 3 }],
    [8, { min: 0, max: 3 }],
]);

const phaseBeamsByLevel: LevelYield = new Map([
    [1, { min: 0, max: 0 }],
    [2, { min: 0, max: 0 }],
    [3, { min: 0, max: 0 }],
    [4, { min: 0, max: 0 }],
    [5, { min: 0, max: 1 }],
    [6, { min: 0, max: 1 }],
    [7, { min: 0, max: 1 }],
    [8, { min: 0, max: 1 }],
]);

const doublePrizeBeamsByLevel: LevelYield = new Map([
    [1, { min: 0, max: 0 }],
    [2, { min: 0, max: 0 }],
    [3, { min: 0, max: 1 }],
    [4, { min: 0, max: 1 }],
    [5, { min: 0, max: 2 }],
    [6, { min: 0, max: 2 }],
    [7, { min: 0, max: 2 }],
    [8, { min: 0, max: 3 }],
]);

const waterBeamsByLevel: LevelYield = new Map([
    [1, { min: 0, max: 0 }],
    [2, { min: 0, max: 1 }],
    [3, { min: 0, max: 1 }],
    [4, { min: 0, max: 1 }],
    [5, { min: 0, max: 1 }],
    [6, { min: 0, max: 2 }],
    [7, { min: 0, max: 2 }],
    [8, { min: 0, max: 2 }],
]);

const normalBombsByLevel: LevelYield = new Map([
    [1, { min: 2, max: 2 }],
    [2, { min: 2, max: 3 }],
    [3, { min: 2, max: 3 }],
    [4, { min: 2, max: 4 }],
    [5, { min: 2, max: 4 }],
    [6, { min: 2, max: 5 }],
    [7, { min: 3, max: 5 }],
    [8, { min: 4, max: 6 }],
]);

export function getPrizeDistribution(prize: Prize): LevelYield | undefined {
    switch (prize) {
        case MoneyPrize.Jackpot:
            return jackpotsByLevel;
        case MoneyPrize.LargeSum:
            return largeSumsByLevel;
        case MoneyPrize.MediumSum:
            return mediumSumsByLevel;
        case MoneyPrize.SmallSum:
            return smallSumsByLevel;
        case InventoryPrize.Plus1Beam:
            return plus1BeamsByLevel;
        case InventoryPrize.Plus3Beams:
            return plus3BeamsByLevel;
        case InventoryPrize.Minus1Beam:
            return minus1BeamsByLevel;
        case Beam.Comet:
            return cometBeamsByLevel;
        case Beam.Flame:
            return flameBeamsByLevel;
        case Beam.Phase:
            return phaseBeamsByLevel;
        case Beam.DoublePrize:
            return doublePrizeBeamsByLevel;
        case Beam.Water:
            return waterBeamsByLevel;
        case Bomb.Normal:
            return normalBombsByLevel;
    }
    return undefined;
}

export function getYieldRange(prize: Prize, level: number): Range {
    const defaultRange: Range = { min: 0, max: 0 };

    const distribution = getPrizeDistribution(prize);
    return distribution?.get(level) ?? defaultRange;
}

function getTotalRange1StdDev(level: number): Range {
    let totalAvg = 0;
    let totalVariance = 0;
    for (let prize of prizes) {
        const range = getYieldRange(prize, level);

        const avg = (range.min + range.max) / 2;
        totalAvg += avg;

        // See https://en.wikipedia.org/wiki/Discrete_uniform_distribution.
        const variance = Math.pow(range.max + 1 - range.min, 2) / 12;
        // Total variance can be summed since each random variable is independent:
        // https://www.probabilitycourse.com/chapter6/6_1_2_sums_random_variables.php.
        totalVariance += variance;
    }

    const stdDev = Math.sqrt(totalVariance);
    return { min: totalAvg - stdDev, max: totalAvg + stdDev };
}

export function getTotalRange(level: number): Range {
    const stdDevRange = getTotalRange1StdDev(level);
    return { min: Math.floor(stdDevRange.min), max: Math.floor(stdDevRange.max) };
}

const levelsArr = Array.from({ length: 8 }, (_, i) => i + 1);
export const totalByLevel: LevelYield =
    new Map(levelsArr.map((level) => [level, getTotalRange(level)]));

const probabilityUnreachable: ReadonlyMap<string, number> = new Map([
    [jackpotPrize.toString(), 0],
    [largeSumPrize.toString(), 0.2],
    [mediumSumPrize.toString(), 0.3],
    [smallSumPrize.toString(), 0.4],
    [plus1BeamPrize.toString(), 0.2],
    [plus3BeamsPrize.toString(), 0.2],
    [minus1BeamPrize.toString(), 0.2],
    [cometBeam.toString(), 0.2],
    [flameBeam.toString(), 0.2],
    [phaseBeam.toString(), 0.2],
    [doublePrizeBeam.toString(), 0.2],
    [waterBeam.toString(), 0.2],
    [normalBomb.toString(), 0.2],
]);

export function getProbUnreachable(prize: Prize): number {
    return probabilityUnreachable.get(prize.toString()) ?? 0;
}

// Number of hidden Bronzors in each level
export const hiddenBronzorsByLevel: ReadonlyMap<number, number> = new Map([
    [1, 0],
    [2, 1],
    [3, 1],
    [4, 2],
    [5, 2],
    [6, 3],
    [7, 3],
    [8, 4],
]);
