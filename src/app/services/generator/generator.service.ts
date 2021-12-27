import { Injectable } from '@angular/core';
import { BeamPointType, BoardConfig, BoardHistory, Bronzor } from '../../board';
import { BoardGameService } from '../board-game/board-game.service';
import { Coord } from '../../common/coord';
import { getPrizeDistribution, getProbUnreachable, getTotalRange, getYieldRange, hiddenBronzorsByLevel } from '../../data/generator-tables';
import { Beam, getCategory, Prize, PrizeCategory, prizes, PrizeState } from '../../common/prizes';
import { getRandomInt, getRandomItemFromSet } from '../../util/random';
import { Grid } from 'src/app/common/grid';

// At most 50% of the prizes in each category (e.g. MoneyPrize, InventoryPrize),
// will be in unreachable locations.
const MAX_UNREACHABLE_PER_PRIZE = 0.5;

type PrizeCategoryTally = Map<PrizeCategory, PrizeCount>;

interface PrizeCount {
  unreachable: number;
  total: number;
};

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  config: BoardConfig = {} as BoardConfig;
  grid: Grid = {} as Grid;

  constructor(private boardGameService: BoardGameService) {
  }

  generateBoard(config: BoardConfig, level: number): void {
    this.config = config;
    this.grid = new Grid(config.length, config.length)

    const history: BoardHistory = { beamPaths: [] };
    const board = {
      config: this.config,
      bronzors: [],
      prizes: [],
      history: history
    };
    this.boardGameService.new(board);

    const bronzors = this.placeBronzors(level);
    this.boardGameService.board.bronzors = bronzors;

    this.placePrizes(level);
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

  private placePrizes(level: number): void {
    const prizeCounts: Map<Prize, number> = new Map();
    const prizeCategoryTally: PrizeCategoryTally = new Map();
    const takenCoords: Set<string> = new Set();
    const allCoordsSet = this.coordSet(this.ioCoords());
    const reachableSet = this.coordSet(this.reachableCoords());

    let currentPrizes = 0;
    const prizeLimit = this.getTotalPrizes(level);

    // Place minimum number of each prize on the board.
    for (let prize of prizes) {
      const prizeYield = getYieldRange(prize, level);
      for (let i = 0; i < prizeYield.min; i++) {
        this.placePrizeOnBoard(prize, prizeCategoryTally, allCoordsSet, takenCoords, reachableSet);
        this.incrementMap(prizeCounts, prize, 1);
        currentPrizes++;
      }
    }

    // Place remaining prizes on the board.
    for (let i = currentPrizes; i < prizeLimit; i++) {
      // Pick a prize that isn't maxed out at random and place it on the board.
      const prize = this.getRandomAvailablePrize(prizeCounts, level);
      if (!prize) continue;

      this.placePrizeOnBoard(prize, prizeCategoryTally, allCoordsSet, takenCoords, reachableSet);
      this.incrementMap(prizeCounts, prize, 1);
    }
  }

  private placePrizeOnBoard(prize: Prize, tally: PrizeCategoryTally, allCoords: Set<string>, takenCoords: Set<string>, reachableCoords: Set<string>): void {
    const prizeCount = tally.get(getCategory(prize)) ?? { unreachable: 0, total: 0 };
    const underThreshold = (prizeCount.unreachable + 1) / (prizeCount.total + 1)
      <= MAX_UNREACHABLE_PER_PRIZE;
    const unreachable = Math.random() < getProbUnreachable(prize) && underThreshold;

    const openCoords = new Set([...allCoords].filter((coord) => !takenCoords.has(coord)));
    const reachableOpenCoords = new Set([...openCoords].filter((coord) => reachableCoords.has(coord)));
    const unreachableOpenCoords = new Set([...openCoords].filter((coord) => !reachableCoords.has(coord)));

    const candidates = (unreachable && unreachableOpenCoords.size) ?
      unreachableOpenCoords : reachableOpenCoords;
    const randCoord = getRandomItemFromSet(candidates);

    takenCoords.add(randCoord);
    prizeCount.total++;
    if (candidates === unreachableOpenCoords) prizeCount.unreachable++;
    tally.set(getCategory(prize), prizeCount);

    const placedCoord = Coord.fromString(randCoord);
    this.boardGameService.addPrize(placedCoord, prize);
  }

  private reachableCoords(): Coord[] {
    const reachable = [];
    const ioCoords = this.ioCoords();
    for (let coord of ioCoords) {
      // Fire a beam into the board from this coord and record where it is
      // emitted.
      const beamPath = this.boardGameService.fireBeam(Beam.Normal, coord, true);
      if (!beamPath) continue;

      const lastPoint = beamPath.path[beamPath.path.length - 1];
      if (lastPoint.type !== BeamPointType.Emit) continue;

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

  private coordSet(coords: Coord[]): Set<string> {
    const set: Set<string> = new Set();
    coords.forEach((coord) => set.add(coord.toString()))
    return set;
  }

  private getTotalPrizes(level: number): number {
    const totalRange = getTotalRange(level);
    return getRandomInt(totalRange.max + 1 - totalRange.min) + totalRange.min;
  }

  private getRandomAvailablePrize(prizeCounts: Map<Prize, number>, level: number): Prize | undefined {
    const availablePrizeMap = new Map([...prizeCounts].filter(([prize, count]) => {
      const distribution = getPrizeDistribution(prize);
      const maxCount = distribution?.get(level)?.max;
      return maxCount && count <= maxCount;
    }));

    const availablePrizes = [...availablePrizeMap.keys()];
    return availablePrizes[getRandomInt(availablePrizes.length)];
  }

  private incrementMap(map: Map<string, number>, key: string, delta: number) {
    const oldCount = map.get(key) ?? 0;
    map.set(key, oldCount + delta);
  }
}
