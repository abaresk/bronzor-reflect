import { Board, BoardConfig } from './board';

interface Game {
    config: BoardConfig;
    board: Board;
    level: number;
}

export {
    Game,
};
