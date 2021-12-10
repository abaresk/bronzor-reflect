interface Wallet {
    credit: number;
    payout: number;
}

interface Game {
    wallet: Wallet;
    config: BoardConfig;
    board: Board;
}
