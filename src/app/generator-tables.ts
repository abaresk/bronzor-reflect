import { Beam, BeamPrize, beamPrizePayouts, BombPrize, BombType, InventoryPrize, InventoryPrizeType, jackpotPrize, largeSumPrize, mediumSumPrize, MoneyPrize, MoneyPrizeType, normalBombPrize, plus1BeamPrize, Prize, prizes, smallSumPrize } from "./prizes";

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

export function getYieldRange(prize: Prize, level: number): Range {
    const defaultRange: Range = { min: 0, max: 0 };

    let levelYield: LevelYield = new Map();
    if (prize as MoneyPrize) {
        switch (prize.type) {
            case MoneyPrizeType.Jackpot:
                levelYield = jackpotsByLevel;
                break;
            case MoneyPrizeType.LargeSum:
                levelYield = largeSumsByLevel;
                break;
            case MoneyPrizeType.MediumSum:
                levelYield = mediumSumsByLevel;
                break;
            case MoneyPrizeType.SmallSum:
                levelYield = smallSumsByLevel;
                break;
        }
    } else if (prize as InventoryPrize) {
        switch (prize.type) {
            case InventoryPrizeType.Plus1Beam:
                levelYield = plus1BeamsByLevel;
                break;
            case InventoryPrizeType.Plus3Beams:
                levelYield = plus3BeamsByLevel;
                break;
            case InventoryPrizeType.Minus1Beam:
                levelYield = minus1BeamsByLevel;
                break;
        }
    } else if (prize as BeamPrize) {
        switch (prize.type) {
            case Beam.Comet:
                levelYield = cometBeamsByLevel;
                break;
            case Beam.Flame:
                levelYield = flameBeamsByLevel;
                break;
            case Beam.Phase:
                levelYield = phaseBeamsByLevel;
                break;
            case Beam.DoublePrize:
                levelYield = doublePrizeBeamsByLevel;
                break;
            case Beam.Water:
                levelYield = waterBeamsByLevel;
                break;
        }
    } else if (prize as BombPrize) {
        switch (prize.type) {
            case BombType.Normal:
                levelYield = normalBombsByLevel;
                break;
        }
    }

    return levelYield.get(level) ?? defaultRange;
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

export function getProbUnreachable(prize: Prize): number {
    if (prize as MoneyPrize) {
        switch (prize.type) {
            case MoneyPrizeType.Jackpot:
                return 0;
            case MoneyPrizeType.LargeSum:
                return 0.2;
            case MoneyPrizeType.MediumSum:
                return 0.3;
            case MoneyPrizeType.SmallSum:
                return 0.4;
        }
    } else if (prize as InventoryPrize) {
        switch (prize.type) {
            case InventoryPrizeType.Plus1Beam:
                return 0.2;
            case InventoryPrizeType.Plus3Beams:
                return 0.2;
            case InventoryPrizeType.Minus1Beam:
                return 0.2;
        }
    } else if (prize as BeamPrize) {
        switch (prize.type) {
            case Beam.Comet:
                return 0.2;
            case Beam.Flame:
                return 0.2;
            case Beam.Phase:
                return 0.2;
            case Beam.DoublePrize:
                return 0.2;
            case Beam.Water:
                return 0.2;
        }
    } else if (prize as BombPrize) {
        switch (prize.type) {
            case BombType.Normal:
                return 0.2
        }
    }

    return 0;
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
