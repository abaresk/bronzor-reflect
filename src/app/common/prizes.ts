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

export enum Beam {
  Normal = 'Beam.Normal',
  Comet = 'Beam.Comet',
  Flame = 'Beam.Flame',
  FlashCannon = 'Beam.FlashCannon',
  Shadow = 'Beam.Shadow',
  Psybeam = 'Beam.Pysbeam',
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

// Items that appear in inventory
export const normalBeam = Beam.Normal;

// Items that appear as prizes
export const jackpotPrize = MoneyPrize.Jackpot;
export const largeSumPrize = MoneyPrize.LargeSum;
export const mediumSumPrize = MoneyPrize.MediumSum;
export const smallSumPrize = MoneyPrize.SmallSum;
export const plus3BeamsPrize = InventoryPrize.Plus3Beams;
export const plus5BeamsPrize = InventoryPrize.Plus5Beams;
export const minus1BeamPrize = InventoryPrize.Minus1Beam;
export const cometBeam = Beam.Comet;
export const flameBeam = Beam.Flame;
export const flashCannonBeam = Beam.FlashCannon;
export const shadowBeam = Beam.Shadow;
export const psyBeam = Beam.Psybeam;
export const doublePrizeBeam = Beam.DoublePrize;
export const waterBeam = Beam.Water;
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

const negativePrizes: ReadonlySet<Prize> = new Set([
  minus1BeamPrize,
  normalBomb,
]);

export function positivePrize(prize: Prize): boolean {
  return !negativePrizes.has(prize)
}

// Interactions
const bombTriggers: ReadonlySet<Beam> = new Set([
  normalBeam,
  cometBeam,
  shadowBeam,
  psyBeam,
  doublePrizeBeam,
]);

export function triggersBomb(beam: Beam): boolean {
  return bombTriggers.has(beam);
}

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
  [shadowBeam.toString(), 1],
  [psyBeam.toString(), 1],
  [doublePrizeBeam.toString(), 1],
  [waterBeam.toString(), 1],
  [normalBomb.toString(), 1],
]);

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
