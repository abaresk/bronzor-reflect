import { Beam, bombTriggers, cometBeam, doublePrizeBeam, flameBeam, flashCannonBeam, normalBeam, psyBeam, shadowBeam, waterBeam } from "../parameters/beams";
import { Bomb, InventoryPrize, MoneyPrize, Prize, jackpotPayout, jackpotPrize, largeSumPrize, mediumSumPrize, minus1BeamPrize, negativePrizes, normalBomb, plus3BeamsPrize, plus5BeamsPrize, prizePayouts, smallSumPrize } from "../parameters/prizes";

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

export function positivePrize(prize: Prize): boolean {
  return !negativePrizes.has(prize)
}

export function triggersBomb(beam: Beam): boolean {
  return bombTriggers.has(beam);
}

export interface PrizeState {
  prize: Prize;
  taken: boolean;
}

const prizeDisplays: ReadonlyMap<string, string> = new Map([
  [largeSumPrize.toString(), `$${prizePayouts.get(largeSumPrize.toString())}`],
  [mediumSumPrize.toString(), `$${prizePayouts.get(mediumSumPrize.toString())}`],
  [smallSumPrize.toString(), `$${prizePayouts.get(smallSumPrize.toString())}`],
  [plus3BeamsPrize.toString(), '+3 beams'],
  [plus5BeamsPrize.toString(), '+5 beams'],
  [minus1BeamPrize.toString(), '-1 beam'],
  [normalBeam.toString(), 'normal beam'],
  [cometBeam.toString(), 'comet beam'],
  [flameBeam.toString(), 'flame beam'],
  [flashCannonBeam.toString(), 'flash cannon'],
  [shadowBeam.toString(), 'shadow beam'],
  [psyBeam.toString(), 'psy beam'],
  [doublePrizeBeam.toString(), 'x2 beam'],
  [waterBeam.toString(), 'water beam'],
  [normalBomb.toString(), 'bomb'],
]);

export function getPrizeText(prize: Prize, jackpotsCollected: number): string {
  if (prize === MoneyPrize.Jackpot) {
    return `J ($${jackpotPayout(jackpotsCollected)})`;
  }

  return prizeDisplays.get(prize.toString()) ?? '';
}

// Single-character abbreviation for the prize.
const prizeDisplaysMini: ReadonlyMap<string, string> = new Map([
  [jackpotPrize.toString(), 'J'],
  [largeSumPrize.toString(), 'l'],
  [mediumSumPrize.toString(), 'm'],
  [smallSumPrize.toString(), 's'],
  [normalBeam.toString(), 'N'],
  [cometBeam.toString(), 'M'],
  [flameBeam.toString(), 'F'],
  [flashCannonBeam.toString(), 'C'],
  [shadowBeam.toString(), 'S'],
  [psyBeam.toString(), 'P'],
  [doublePrizeBeam.toString(), 'D'],
  [waterBeam.toString(), 'W'],
  [plus3BeamsPrize.toString(), '3'],
  [plus5BeamsPrize.toString(), '5'],
  [minus1BeamPrize.toString(), '-'],
  [normalBomb.toString(), 'X'],
]);

// Returns a single-character abbreviation for the prize.
export function getPrizeTextMini(prize: Prize): string {
  return prizeDisplaysMini.get(prize.toString()) ?? '';
}
