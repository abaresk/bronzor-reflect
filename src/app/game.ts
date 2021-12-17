import { Board, BoardConfig } from './board';
import { Beam } from './items';

interface Wallet {
    credit: number;
    payout: number;
}

interface Inventory {
    beams: Map<Beam, number>;
}

interface Game {
    config: BoardConfig;
    board: Board;
    level: number;
    wallet: Wallet;
    inventory: Inventory;
}

export {
    Game,
    Inventory,
    Wallet,
};
