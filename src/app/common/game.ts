import { BoardConfig } from './board';

export interface Game {
  config: BoardConfig;
  level: number;
  roundsCount: number;
}
