import { Range } from "../common/range";
import { cometBeam, doublePrizeBeam, psyBeam, shadowBeam, waterBeam } from "./beams";
import { jackpotPrize, largeSumPrize, mediumSumPrize, minus1BeamPrize, normalBomb, plus3BeamsPrize, plus5BeamsPrize, smallSumPrize } from "./prizes";

// At most 50% of the prizes in each category (e.g. MoneyPrize, InventoryPrize),
// will be in unreachable locations.
export const MAX_UNREACHABLE_PER_PRIZE = 0.5;

export type LevelYield = ReadonlyMap<number, Range>;

export const jackpotsByLevel: LevelYield = new Map([
  [1, { min: 1, max: 1 }],
  [2, { min: 2, max: 2 }],
  [3, { min: 2, max: 3 }],
  [4, { min: 3, max: 4 }],
  [5, { min: 3, max: 5 }],
  [6, { min: 4, max: 5 }],
  [7, { min: 5, max: 6 }],
  [8, { min: 6, max: 7 }],
]);

export const largeSumsByLevel: LevelYield = new Map([
  [1, { min: 1, max: 1 }],
  [2, { min: 1, max: 1 }],
  [3, { min: 1, max: 2 }],
  [4, { min: 1, max: 2 }],
  [5, { min: 1, max: 2 }],
  [6, { min: 2, max: 3 }],
  [7, { min: 2, max: 3 }],
  [8, { min: 2, max: 4 }],
]);

export const mediumSumsByLevel: LevelYield = new Map([
  [1, { min: 1, max: 3 }],
  [2, { min: 1, max: 3 }],
  [3, { min: 2, max: 4 }],
  [4, { min: 2, max: 4 }],
  [5, { min: 3, max: 5 }],
  [6, { min: 3, max: 5 }],
  [7, { min: 4, max: 6 }],
  [8, { min: 4, max: 6 }],
]);

export const smallSumsByLevel: LevelYield = new Map([
  [1, { min: 3, max: 5 }],
  [2, { min: 3, max: 5 }],
  [3, { min: 3, max: 5 }],
  [4, { min: 4, max: 6 }],
  [5, { min: 4, max: 6 }],
  [6, { min: 4, max: 6 }],
  [7, { min: 4, max: 7 }],
  [8, { min: 4, max: 7 }],
]);

export const plus3BeamsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 1 }],
  [2, { min: 0, max: 1 }],
  [3, { min: 0, max: 1 }],
  [4, { min: 0, max: 2 }],
  [5, { min: 0, max: 2 }],
  [6, { min: 0, max: 3 }],
  [7, { min: 1, max: 4 }],
  [8, { min: 1, max: 4 }],
]);

export const plus5BeamsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 0 }],
  [2, { min: 0, max: 0 }],
  [3, { min: 0, max: 0 }],
  [4, { min: 0, max: 1 }],
  [5, { min: 0, max: 1 }],
  [6, { min: 0, max: 1 }],
  [7, { min: 0, max: 2 }],
  [8, { min: 0, max: 2 }],
]);

export const minus1BeamsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 0 }],
  [2, { min: 0, max: 0 }],
  [3, { min: 0, max: 1 }],
  [4, { min: 0, max: 1 }],
  [5, { min: 0, max: 1 }],
  [6, { min: 0, max: 1 }],
  [7, { min: 0, max: 2 }],
  [8, { min: 0, max: 2 }],
]);

export const cometBeamsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 0 }],
  [2, { min: 0, max: 0 }],
  [3, { min: 0, max: 0 }],
  [4, { min: 0, max: 1 }],
  [5, { min: 0, max: 1 }],
  [6, { min: 0, max: 1 }],
  [7, { min: 0, max: 2 }],
  [8, { min: 0, max: 2 }],
]);

export const flameBeamsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 0 }],
  [2, { min: 0, max: 0 }],
  [3, { min: 0, max: 0 }],
  [4, { min: 0, max: 0 }],
  [5, { min: 0, max: 0 }],
  [6, { min: 0, max: 0 }],
  [7, { min: 0, max: 0 }],
  [8, { min: 0, max: 0 }],
]);

export const flashCannonsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 0 }],
  [2, { min: 0, max: 0 }],
  [3, { min: 0, max: 0 }],
  [4, { min: 0, max: 0 }],
  [5, { min: 0, max: 0 }],
  [6, { min: 0, max: 0 }],
  [7, { min: 0, max: 0 }],
  [8, { min: 0, max: 0 }],
]);

export const shadowBeamsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 0 }],
  [2, { min: 0, max: 0 }],
  [3, { min: 0, max: 1 }],
  [4, { min: 0, max: 1 }],
  [5, { min: 0, max: 2 }],
  [6, { min: 0, max: 2 }],
  [7, { min: 0, max: 3 }],
  [8, { min: 0, max: 3 }],
]);

export const psyBeamsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 0 }],
  [2, { min: 0, max: 0 }],
  [3, { min: 0, max: 0 }],
  [4, { min: 0, max: 0 }],
  [5, { min: 0, max: 1 }],
  [6, { min: 0, max: 1 }],
  [7, { min: 0, max: 1 }],
  [8, { min: 0, max: 1 }],
]);

export const doublePrizeBeamsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 0 }],
  [2, { min: 0, max: 0 }],
  [3, { min: 0, max: 1 }],
  [4, { min: 0, max: 1 }],
  [5, { min: 0, max: 2 }],
  [6, { min: 0, max: 2 }],
  [7, { min: 0, max: 2 }],
  [8, { min: 0, max: 3 }],
]);

export const waterBeamsByLevel: LevelYield = new Map([
  [1, { min: 0, max: 0 }],
  [2, { min: 0, max: 1 }],
  [3, { min: 0, max: 1 }],
  [4, { min: 0, max: 1 }],
  [5, { min: 0, max: 1 }],
  [6, { min: 0, max: 2 }],
  [7, { min: 0, max: 2 }],
  [8, { min: 0, max: 2 }],
]);

export const normalBombsByLevel: LevelYield = new Map([
  [1, { min: 2, max: 2 }],
  [2, { min: 2, max: 3 }],
  [3, { min: 2, max: 3 }],
  [4, { min: 2, max: 4 }],
  [5, { min: 2, max: 4 }],
  [6, { min: 2, max: 5 }],
  [7, { min: 3, max: 5 }],
  [8, { min: 4, max: 6 }],
]);

export const probabilityUnreachable: ReadonlyMap<string, number> = new Map([
  [jackpotPrize.toString(), 0],
  [largeSumPrize.toString(), 0.2],
  [mediumSumPrize.toString(), 0.3],
  [smallSumPrize.toString(), 0.4],
  [plus3BeamsPrize.toString(), 0.2],
  [plus5BeamsPrize.toString(), 0.2],
  [minus1BeamPrize.toString(), 0.2],
  [cometBeam.toString(), 0.2],
  [shadowBeam.toString(), 0.2],
  [psyBeam.toString(), 0.2],
  [doublePrizeBeam.toString(), 0.2],
  [waterBeam.toString(), 0.2],
  [normalBomb.toString(), 0.2],
]);

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
