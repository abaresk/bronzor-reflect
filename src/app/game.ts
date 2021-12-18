import { BoardConfig } from './board';

interface Game {
    config: BoardConfig;
    level: number;
    roundsCount: number;
}

export {
    Game,
};
