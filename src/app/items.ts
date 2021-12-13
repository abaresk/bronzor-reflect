enum MoneyPrize {
    Jackpot,
    LargeSum,
    MediumSum,
    SmallSum,
}

enum InventoryPrize {
    Plus1Beam,
    Plus3Beams,
    Minus1Beam,
}

enum Beam {
    Normal,
    Comet,
    Flame,
    Phase,
    DoublePrize,
    Water,
}

type Prize = | MoneyPrize | InventoryPrize | Beam;

const prizes = [
    MoneyPrize.Jackpot,
    MoneyPrize.LargeSum,
    MoneyPrize.MediumSum,
    MoneyPrize.SmallSum,
    InventoryPrize.Plus1Beam,
    InventoryPrize.Plus3Beams,
    InventoryPrize.Minus1Beam,
    Beam.Comet,
    Beam.Flame,
    Beam.Phase,
    Beam.DoublePrize,
    Beam.Water,
] as const;


interface PrizeState {
    prize: Prize;
    taken: boolean;
}

export {
    prizes,
    Beam,
    InventoryPrize,
    MoneyPrize,
    Prize,
    PrizeState,
};
