interface MoneyPrize {
    type: MoneyPrizeType;
}

enum MoneyPrizeType {
    Jackpot,
    LargeSum,
    MediumSum,
    SmallSum,
}

interface InventoryPrize {
    type: InventoryPrizeType;
}

enum InventoryPrizeType {
    Plus1Beam,
    Plus3Beams,
    Minus1Beam,
}

interface BeamPrize {
    type: Beam;
}

enum Beam {
    Normal,
    Comet,
    Flame,
    Phase,
    DoublePrize,
    Water,
}

interface BombPrize {
    type: BombType;
}

enum BombType {
    Normal,
};

const jackpotPrize: MoneyPrize = { type: MoneyPrizeType.Jackpot };
const largeSumPrize: MoneyPrize = { type: MoneyPrizeType.LargeSum };
const mediumSumPrize: MoneyPrize = { type: MoneyPrizeType.MediumSum };
const smallSumPrize: MoneyPrize = { type: MoneyPrizeType.SmallSum };
const plus1BeamPrize: InventoryPrize = { type: InventoryPrizeType.Plus1Beam };
const plus3BeamsPrize: InventoryPrize = { type: InventoryPrizeType.Plus3Beams };
const minus1BeamPrize: InventoryPrize = { type: InventoryPrizeType.Minus1Beam };
const cometBeamPrize: BeamPrize = { type: Beam.Comet };
const flameBeamPrize: BeamPrize = { type: Beam.Flame };
const phaseBeamPrize: BeamPrize = { type: Beam.Phase };
const doublePrizePrize: BeamPrize = { type: Beam.DoublePrize };
const waterBeamPrize: BeamPrize = { type: Beam.Water };
const normalBombPrize: BombPrize = { type: BombType.Normal };

type Prize = | MoneyPrize | InventoryPrize | BeamPrize | BombPrize;

const prizes: ReadonlyArray<Prize> = [
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
const jackpotPayouts: ReadonlyMap<number, number> = new Map([
    [1, 30],
    [2, 50],
    [3, 80],
    [4, 120],
    [5, 180],
    [6, 280],
    [7, 400],
    [8, 600],
]);

const moneyPrizePayouts: ReadonlyMap<MoneyPrize, number> = new Map([
    [largeSumPrize, 20],
    [mediumSumPrize, 10],
    [smallSumPrize, 3],
]);

const inventoryPrizePayouts: ReadonlyMap<InventoryPrize, number> = new Map([
    [plus1BeamPrize, 1],
    [plus3BeamsPrize, 3],
    [minus1BeamPrize, -1],
]);

const beamPrizePayouts: ReadonlyMap<BeamPrize, number> = new Map([
    [cometBeamPrize, 1],
    [flameBeamPrize, 1],
    [phaseBeamPrize, 1],
    [doublePrizePrize, 1],
    [waterBeamPrize, 1],
]);

interface PrizeState {
    prize: Prize;
    taken: boolean;
}

export {
    beamPrizePayouts,
    inventoryPrizePayouts,
    jackpotPayouts,
    moneyPrizePayouts,
    prizes,
    Beam,
    BeamPrize,
    InventoryPrize,
    MoneyPrize,
    MoneyPrizeType,
    Prize,
    PrizeState,
};
