import { Board, BoardConfig } from './board';
import { Beam } from './items';
import { Wallet } from './wallet';

interface Inventory {
    beams: Map<Beam, number>;
}

interface Game {
    config: BoardConfig;
    board: Board;
    level: number;
    inventory: Inventory;
}

export {
    Game,
    Inventory,
};
