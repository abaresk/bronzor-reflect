import { Injectable } from '@angular/core';
import { BeamPointType, Board, BoardConfig, BoardHistory, Bronzor } from 'src/app/common/board';
import { BoardGame } from '../../core/board-game';
import { Coord } from '../../common/geometry/coord';
import { getPrizeDistribution, getProbUnreachable, getTotalRange, getYieldRange, hiddenBronzorsByLevel } from '../../data/generator-tables';
import { Beam, getCategory, MoneyPrize, Prize, PrizeCategory, prizes, PrizeState } from '../../common/prizes';
import { randomInt, randomFromSet } from '../../util/random';
import { Grid } from 'src/app/common/geometry/grid';
import { CustomSet } from 'src/app/util/custom-set';

// At most 50% of the prizes in each category (e.g. MoneyPrize, InventoryPrize),
// will be in unreachable locations.
const MAX_UNREACHABLE_PER_PRIZE = 0.5;

type PrizeCategoryTally = Map<PrizeCategory, PrizeCount>;

interface PrizeCount {
  unreachable: number;
  total: number;
};

interface PrizeGenConstraints {
  reachableCoords: CustomSet<string>;
  ioMap: Map<string, Coord | undefined>;
};

interface PrizeGenState {
  takenCoords: Map<string, Prize>;
  prizeCounts: Map<Prize, number>;
  prizeCategoryTally: PrizeCategoryTally;
};

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  config: BoardConfig = {} as BoardConfig;
  grid: Grid = {} as Grid;

  constructor() {
  }

  generateBoard(config: BoardConfig, level: number): Board {
    this.config = config;
    this.grid = new Grid(config.length, config.length)

    const history: BoardHistory = { beamPaths: [] };
    const board = {
      config: this.config,
      bronzors: [],
      prizes: [],
      history: history
    };
    const boardGame = new BoardGame(board);
    const bronzors = this.placeBronzors(level);
    boardGame.board.bronzors = bronzors;

    this.placePrizes(boardGame, level);
    return boardGame.board;
  }

  // TODO: Factor in level when placing Bronzors.
  private placeBronzors(level: number): Bronzor[] {
    const bronzors = [];
    const hiddenBronzors = hiddenBronzorsByLevel.get(level) ?? 0;
    const length = this.config.length;
    const bronzorCount = this.config.bronzorCount;

    // For now, placement is completely random.
    const tiles = [...Array(length * length).keys()];
    const shuffled = tiles.sort(() => 0.5 - Math.random());
    const bronzorLocations = shuffled.slice(0, bronzorCount);

    for (let i = 0; i < bronzorCount; i++) {
      const location = bronzorLocations[i];
      const coord = new Coord(Math.floor(location / length), location % length);
      bronzors.push({ coord: coord, active: true, visible: i >= hiddenBronzors });
    }
    return bronzors;
  }

  private placePrizes(boardGame: BoardGame, level: number): void {
    const state: PrizeGenState = {
      takenCoords: new Map(),
      prizeCounts: new Map(),
      prizeCategoryTally: new Map(),
    };
    const constraints: PrizeGenConstraints = {
      reachableCoords: this.coordSet(this.reachableCoords(boardGame)),
      ioMap: this.inputOutputMap(boardGame),
    };

    let currentPrizes = 0;
    const prizeLimit = this.getTotalPrizes(level);

    // Place minimum number of each prize on the board.
    for (let prize of prizes) {
      const prizeYield = getYieldRange(prize, level);
      for (let i = 0; i < prizeYield.min; i++) {
        const success = this.placePrizeOnBoard(boardGame, prize, state, constraints);
        if (success) {
          this.incrementMap(state.prizeCounts, prize, 1);
          currentPrizes++;
        }
      }
    }

    // Place remaining prizes on the board.
    for (let i = currentPrizes; i < prizeLimit; i++) {
      // Pick a prize that isn't maxed out at random and place it on the board.
      const prize = this.getRandomAvailablePrize(state.prizeCounts, level);
      if (!prize) continue;

      const success = this.placePrizeOnBoard(boardGame, prize, state, constraints);
      if (success) {
        this.incrementMap(state.prizeCounts, prize, 1);
      }
    }
  }

  // Returns true if we were able to place a prize on the board
  private placePrizeOnBoard(boardGame: BoardGame, prize: Prize, state: PrizeGenState, constraints: PrizeGenConstraints): boolean {
    const prizeCount = state.prizeCategoryTally.get(getCategory(prize)) ?? { unreachable: 0, total: 0 };
    const underThreshold = (prizeCount.unreachable + 1) / (prizeCount.total + 1)
      <= MAX_UNREACHABLE_PER_PRIZE;
    const unreachable = Math.random() < getProbUnreachable(prize) && underThreshold;

    const takenCoords = new CustomSet(Array.from(state.takenCoords.keys()));
    const allCoords = this.coordSet(this.ioCoords());
    const openCoords = allCoords.difference(takenCoords);

    let reachableCoords = constraints.reachableCoords;
    if (prize === MoneyPrize.Jackpot) {
      reachableCoords = this.updateJackpotReachable(state, constraints, reachableCoords);
    }

    const reachableOpenCoords = openCoords.intersect(reachableCoords);
    const unreachableOpenCoords = openCoords.difference(reachableCoords);

    // TODO: Re-think the prize placement algorithm completely. Be more
    // methodical - don't allow for failure cases, like running out of
    // (un)reachable spots. Perhaps there should be a separate distribution
    // tables for reachable/unreachable prize counts?
    let candidates = undefined;
    if (unreachable && unreachableOpenCoords.size) {
      candidates = unreachableOpenCoords;
    } else if (reachableOpenCoords.size) {
      candidates = reachableOpenCoords;
    }
    if (!candidates) return false;

    const randCoord = randomFromSet(candidates);

    state.takenCoords.set(randCoord, prize);
    prizeCount.total++;
    if (candidates === unreachableOpenCoords) prizeCount.unreachable++;
    state.prizeCategoryTally.set(getCategory(prize), prizeCount);

    const placedCoord = Coord.fromString(randCoord);
    boardGame.addPrize(placedCoord, prize);
    return true;
  }

  // The Jackpot is a special case because it must always be reachable.
  // Therefore, it shouldn't be paired with another Jackpot.
  private updateJackpotReachable(state: PrizeGenState, constraints: PrizeGenConstraints, reachableCoords: CustomSet<string>): CustomSet<string> {
    for (let [coord, prize] of state.takenCoords) {
      if (prize === MoneyPrize.Jackpot) {
        const outputCoord = constraints.ioMap.get(coord);
        if (outputCoord) {
          reachableCoords.delete(outputCoord.toString());
        }
      }
    }
    return reachableCoords;
  }

  private inputOutputMap(boardGame: BoardGame): Map<string, Coord | undefined> {
    const inputOutputMap: Map<string, Coord | undefined> = new Map();
    const ioCoords = this.ioCoords();
    for (let coord of ioCoords) {
      // Fire a beam into the board from this coord and record where it is
      // emitted.
      const beamPath = boardGame.fireBeam(Beam.Normal, coord, true);
      if (!beamPath) continue;

      const lastPoint = beamPath.path[beamPath.path.length - 1];
      let outputCoord: Coord | undefined = lastPoint.coord;
      if (lastPoint.type !== BeamPointType.Emit || coord.equals(lastPoint.coord)) {
        outputCoord = undefined;
      }

      inputOutputMap.set(coord.toString(), outputCoord);
    }
    return inputOutputMap;
  }

  private reachableCoords(boardGame: BoardGame): Coord[] {
    const reachable = [];
    const ioCoords = this.ioCoords();
    for (let coord of ioCoords) {
      // Fire a beam into the board from this coord and record where it is
      // emitted.
      const beamPath = boardGame.fireBeam(Beam.Normal, coord, true);
      if (!beamPath) continue;

      const lastPoint = beamPath.path[beamPath.path.length - 1];
      if (lastPoint.type !== BeamPointType.Emit) continue;
      if (coord.equals(lastPoint.coord)) continue;

      reachable.push(lastPoint.coord);
    }
    return reachable;
  }

  // All coordinates surrounding the board where a beam can be fired or
  // emitted.
  private ioCoords(): Coord[] {
    const edgeSegments = this.grid.edgeSegments(1);
    const coords = edgeSegments.map((segment) => segment.allCoords());
    return coords.flat(2);
  }

  private coordSet(coords: Coord[]): CustomSet<string> {
    const set = new CustomSet();
    coords.forEach((coord) => set.add(coord.toString()))
    return set;
  }

  private getTotalPrizes(level: number): number {
    const totalRange = getTotalRange(level);
    return randomInt(totalRange.max + 1 - totalRange.min) + totalRange.min;
  }

  private getRandomAvailablePrize(prizeCounts: Map<Prize, number>, level: number): Prize | undefined {
    const availablePrizes = prizes.filter((prize) => {
      const count = prizeCounts.get(prize) ?? 0;
      const distribution = getPrizeDistribution(prize);
      const maxCount = distribution?.get(level)?.max;
      return (maxCount !== undefined) && count < maxCount;
    });
    return availablePrizes[randomInt(availablePrizes.length)];
  }

  private incrementMap(map: Map<string, number>, key: string, delta: number) {
    const oldCount = map.get(key) ?? 0;
    map.set(key, oldCount + delta);
  }
}
