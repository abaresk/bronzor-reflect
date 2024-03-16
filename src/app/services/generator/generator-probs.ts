import { LevelYield, cometBeamsByLevel, doublePrizeBeamsByLevel, flameBeamsByLevel, flashCannonsByLevel, jackpotsByLevel, largeSumsByLevel, mediumSumsByLevel, minus1BeamsByLevel, normalBombsByLevel, plus3BeamsByLevel, plus5BeamsByLevel, probabilityUnreachable, psyBeamsByLevel, shadowBeamsByLevel, smallSumsByLevel, waterBeamsByLevel } from "../../parameters/generator-tables";
import { Range } from "../../common/range";
import { Bomb, InventoryPrize, MoneyPrize, Prize, prizes } from "../../parameters/prizes";
import { Beam } from "../../parameters/beams";

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
        case InventoryPrize.Plus3Beams:
            return plus3BeamsByLevel;
        case InventoryPrize.Plus5Beams:
            return plus5BeamsByLevel;
        case InventoryPrize.Minus1Beam:
            return minus1BeamsByLevel;
        case Beam.Comet:
            return cometBeamsByLevel;
        case Beam.Flame:
            return flameBeamsByLevel;
        case Beam.FlashCannon:
            return flashCannonsByLevel;
        case Beam.Shadow:
            return shadowBeamsByLevel;
        case Beam.Psybeam:
            return psyBeamsByLevel;
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


export function getProbUnreachable(prize: Prize): number {
    return probabilityUnreachable.get(prize.toString()) ?? 0;
}
