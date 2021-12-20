import { Injectable } from '@angular/core';
import { BeamPointType, BoardConfig, BoardHistory, Bronzor } from './board';
import { BoardService } from './board.service';
import { Coord, Grid } from './coord';
import { hiddenBronzorsByLevel } from './generator-tables';
import { Beam, PrizeState } from './prizes';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  config: BoardConfig = {} as BoardConfig;
  grid: Grid = {} as Grid;

  constructor(private boardService: BoardService) {
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
    this.boardService.new(board);

    const bronzors = this.placeBronzors(level);
    this.boardService.board.bronzors = bronzors;

    const prizes = this.placePrizes(bronzors, level);
    this.boardService.board.prizes = prizes;
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

    for (let i = 0; i < hiddenBronzors; i++) {
      const location = bronzorLocations[i];
      const coord = new Coord(Math.floor(location / length), location % length);
      bronzors.push({ coord: coord, active: true, visible: false });
    }

    for (let i = hiddenBronzors; i < bronzorCount; i++) {
      const location = bronzorLocations[i];
      const coord = new Coord(Math.floor(location / length), location % length);
      bronzors.push({ coord: coord, active: true, visible: true });
    }
    return bronzors;
  }

  private placePrizes(bronzors: Bronzor[], level: number): PrizeState[] {
    const allCoordsSet = this.coordSet(this.ioCoords());
    const reachableSet = this.coordSet(this.reachableCoords());

    // TODO: Finish prize generation algorithm.

    return [];
  }

  private reachableCoords(): Coord[] {
    const reachable = [];
    const ioCoords = this.ioCoords();
    for (let coord of ioCoords) {
      // Fire a beam into the board from this coord and record where it is
      // emitted.
      const beamPath = this.boardService.fireBeam(Beam.Normal, coord, true);
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
}
