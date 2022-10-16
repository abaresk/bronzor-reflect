import { Beam, getPrizeTextMini, Prize, PrizeState } from '../common/prizes';
import { BeamPath, BeamPoint, BeamPointType, Board, Bronzor } from 'src/app/common/board';
import { coordInDirection, distanceInDirection, projectToCoord, Coord } from '../common/geometry/coord';
import { Grid } from 'src/app/common/geometry/grid';
import { Direction, directions, oppositeDir, rotateClockwise } from 'src/app/common/geometry/direction';
import { Vector } from 'src/app/common/geometry/vector';

export class BoardGame {
  board: Board = {} as Board;
  grid: Grid = {} as Grid;

  constructor(board: Board) {
    this.board = board;
    this.grid = new Grid(board.config.length, board.config.length);
  }

  fireBeam(beam: Beam, coord: Coord, dryRun: boolean = false): BeamPath | undefined {
    if (!this.isOuterEdge(coord)) return;

    const beamPath = this.generatePath(beam, coord, dryRun);
    if (!dryRun) {
      this.board.history.beamPaths.push(beamPath);
    }
    return beamPath;
  }

  getBronzor(coord: Coord): Bronzor | undefined {
    for (let bronzor of this.board.bronzors) {
      if (bronzor.coord.equals(coord)) return bronzor;
    }
    return undefined;
  }

  getPrizeState(coord: Coord): PrizeState | undefined {
    const prizeTileId = this.prizeTileId(coord);
    return prizeTileId !== -1 ? this.board.prizes[prizeTileId] : undefined;
  }

  getPrizeCoord(tileId: number): Coord | undefined {
    const edgeSegments = this.grid.edgeSegments(1);
    const segment = edgeSegments[Math.floor(tileId / this.board.config.length)];
    return segment.at(tileId % this.board.config.length);
  }

  // Returns the number of the given prize that exist on the board.
  numPrizes(prize: Prize): number {
    let count = 0;
    for (let prizeState of this.board.prizes) {
      if (prizeState?.prize === prize) count++;
    }
    return count;
  }

  addPrize(coord: Coord, prize: Prize) {
    const prizeTileId = this.prizeTileId(coord);
    if (prizeTileId !== -1) {
      this.board.prizes[prizeTileId] = { prize: prize, taken: false };
    }
  }

  takePrizeAt(coord: Coord) {
    const prizeTileId = this.prizeTileId(coord);
    const prizeState = this.board.prizes[prizeTileId];
    if (prizeState) {
      prizeState.taken = true;
    }
  }

  remainingPrizes(): Prize[] {
    const remaining = [];
    for (let prizeState of this.board.prizes) {
      if (prizeState && !prizeState.taken) {
        remaining.push(prizeState);
      }
    }
    return remaining.map((prizeState) => { return prizeState.prize });
  }

  toString(): string {
    let ret = '';
    for (let row = -1; row < this.board.config.length + 1; row++) {
      ret += this.boardRowToString(row);
      if (row != this.board.config.length) {
        ret += '\n';
      }
    }
    return ret;
  }

  private generatePath(beam: Beam, coord: Coord, dryRun: boolean): BeamPath {
    // Place the first coordinate just outside the board. This allows
    // collision detection to work when a Bronzor is on the board edge.
    const firstVector = this.initialVector(coord);
    let firstCoord = firstVector.coord;

    const entry: BeamPoint = { type: BeamPointType.Entry, coord: firstCoord };
    const beamPath: BeamPath = { type: beam, path: [entry] };

    // Psybeams always emit at the opposite coordinate
    if (beam === Beam.Psybeam) {
      const nextCoord =
        this.projectToEdge(firstVector.coord, firstVector.dir).coordAt(firstVector.dir, 1)
      beamPath.path.push({ type: BeamPointType.Emit, coord: nextCoord });
      return beamPath;
    }

    // First check for edge collision
    if (this.checkEdgeCollision(firstVector, beamPath)) {
      return beamPath;
    }

    // Generate next steps until the beam is emitted from the board or hits a
    // Bronzor.
    let nextVector = this.generateNextStep(firstVector, beamPath, dryRun);
    while (nextVector !== undefined) {
      nextVector = this.generateNextStep(nextVector, beamPath, dryRun);
    }
    return beamPath;
  }

  private initialVector(coord: Coord): Vector {
    const edgeSegments = this.grid.edgeSegments(1);

    let dir = Direction.Up;
    for (let i = 0; i < directions.length; i++) {
      if (edgeSegments[i].contains(coord)) {
        dir = directions[i];
      }
    }

    return { coord: coord, dir: oppositeDir(dir) };
  }

  private generateNextStep(vector: Vector, beamPath: BeamPath, dryRun: boolean): Vector | undefined {
    const collisions = this.bronzorsInPath(vector);
    const closestBronzors = this.closestInPath(vector, collisions);

    return this.addToBeamPath(vector, closestBronzors, beamPath, dryRun);
  }

  private bronzorsInPath(vector: Vector): Array<Bronzor> {
    const collisions = [];
    for (let bronzor of this.board.bronzors) {
      if (!bronzor.active) continue;

      // Check if the Bronzor is in the path of the vector, or of the two
      // neighboring parallel vectors.
      for (let i = -1; i <= 1; i++) {
        const perpendicular = rotateClockwise(vector.dir, 1);
        const checkCoord = vector.coord.coordAt(vector.dir, 1).coordAt(perpendicular, i);
        if (coordInDirection(checkCoord, bronzor.coord, vector.dir)) {
          collisions.push(bronzor);
        }
      }
    }

    return collisions;
  }

  private closestInPath(vector: Vector, bronzors: Array<Bronzor>): Array<Bronzor> {
    let minDistance = Infinity;
    for (let bronzor of bronzors) {
      const distance = distanceInDirection(vector.coord, bronzor.coord, vector.dir);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    const closest = [];
    for (let bronzor of bronzors) {
      const distance = distanceInDirection(vector.coord, bronzor.coord, vector.dir);
      if (distance === minDistance) {
        closest.push(bronzor);
      }
    }
    return closest;
  }

  // Adds collision to the beam path. Returns the next Vector of the beam, or
  // undefined if the path is finished.
  private addToBeamPath(vector: Vector, closestBronzors: Array<Bronzor>, beamPath: BeamPath, dryRun: boolean): Vector | undefined {
    if (closestBronzors.length === 0) {
      return this.addToBeamPathMiss(vector, beamPath);
    } else {
      return this.addToBeamPathMultiple(vector, beamPath, closestBronzors, dryRun);
    }
  }

  private addToBeamPathMiss(vector: Vector, beamPath: BeamPath): undefined {
    const nextCoord =
      this.projectToEdge(vector.coord, vector.dir).coordAt(vector.dir, 1);
    const beamPoint: BeamPoint = { type: BeamPointType.Emit, coord: nextCoord };
    beamPath.path.push(beamPoint);
    return undefined;
  }

  private addToBeamPathMultiple(vector: Vector, beamPath: BeamPath, bronzors: Array<Bronzor>, dryRun: boolean): Vector | undefined {
    const directCoords = bronzors.filter(
      (bronzor) => coordInDirection(vector.coord, bronzor.coord, vector.dir));
    const indirectCoords = bronzors.filter(
      (bronzor) => !coordInDirection(vector.coord, bronzor.coord, vector.dir));

    if (directCoords.length) {
      return this.addToBeamPathDirectHit(vector, beamPath, directCoords[0], dryRun);
    } else if (indirectCoords.length === 1) {
      return this.addToBeamPathDeflect(vector, beamPath, indirectCoords[0]);
    } else {
      return this.addToBeamPathDoubleDeflect(vector, beamPath, indirectCoords);
    }
  }

  private addToBeamPathDirectHit(vector: Vector, beamPath: BeamPath, bronzor: Bronzor, dryRun: boolean): Vector | undefined {
    const phase = (beamPath.type === Beam.Shadow);

    if (phase) {
      beamPath.path.push({ type: BeamPointType.Phase, coord: bronzor.coord });
      return { coord: bronzor.coord, dir: vector.dir };
    } else {
      beamPath.path.push({ type: BeamPointType.Hit, coord: bronzor.coord });
      return undefined;
    }
  }

  private addToBeamPathDeflect(vector: Vector, beamPath: BeamPath, bronzor: Bronzor): Vector | undefined {
    // The Coord directly in front of the Bronzor facing the incoming beam.
    const shieldCoord = bronzor.coord.coordAt(oppositeDir(vector.dir), 1);

    const nextCoord = projectToCoord(vector, shieldCoord);
    const perpendicular = rotateClockwise(vector.dir, 1);
    const nextDir =
      coordInDirection(shieldCoord, nextCoord, perpendicular) ?
        perpendicular : oppositeDir(perpendicular);
    beamPath.path.push({ type: BeamPointType.Deflect, coord: nextCoord });
    return { coord: nextCoord, dir: nextDir };
  }

  private addToBeamPathDoubleDeflect(vector: Vector, beamPath: BeamPath, bronzors: Array<Bronzor>): Vector | undefined {
    const nextCoord =
      projectToCoord(vector, bronzors[0].coord)
        .coordAt(oppositeDir(vector.dir), 1);
    beamPath.path.push({ type: BeamPointType.DoubleDeflect, coord: nextCoord });
    return { coord: nextCoord, dir: oppositeDir(vector.dir) };
  }

  // Returns true if there's a collision that terminates the beam path.
  private checkEdgeCollision(vector: Vector, beamPath: BeamPath): boolean {
    const collisions = this.bronzorsInPath(vector);
    const edgeBronzors = collisions.filter((bronzor) => {
      return distanceInDirection(vector.coord, bronzor.coord, vector.dir) === 1;
    });
    const directCoords = edgeBronzors.filter(
      (bronzor) => coordInDirection(vector.coord, bronzor.coord, vector.dir));
    const indirectCoords = edgeBronzors.filter(
      (bronzor) => !coordInDirection(vector.coord, bronzor.coord, vector.dir));

    const nextSpace = vector.coord.coordAt(vector.dir, 1);

    if (!edgeBronzors.length) return false;

    if (beamPath.type === Beam.Shadow) {
      if (indirectCoords.length) {
        beamPath.path.push({ type: BeamPointType.Emit, coord: vector.coord });
        return true;
      } else {
        beamPath.path.push({ type: BeamPointType.Phase, coord: nextSpace });
        return false;
      }
    } else {
      if (directCoords.length) {
        beamPath.path.push({ type: BeamPointType.Hit, coord: nextSpace });
        return true;
      } else {
        beamPath.path.push({ type: BeamPointType.Emit, coord: vector.coord });
        return true;
      }
    }
  }

  // Return the prize tile ID at the specified coordinate, or -1 if `coord`
  // doesn't correspond to a prize tile.
  private prizeTileId(coord: Coord): number {
    const edgeSegments = this.grid.edgeSegments(1);
    for (let i = 0; i < directions.length; i++) {
      const index = edgeSegments[i].indexOf(coord);

      if (index !== -1) return i * this.board.config.length + index;
    }
    return -1;
  }

  private isOuterEdge(coord: Coord): boolean {
    const edgeSegments = this.grid.edgeSegments(1);
    for (let segment of edgeSegments) {
      if (segment.contains(coord)) return true;
    }

    return false;
  }

  private projectToEdge(coord: Coord, dir: Direction): Coord {
    switch (dir) {
      case Direction.Up:
        return new Coord(0, coord.col);
      case Direction.Right:
        return new Coord(coord.row, this.board.config.length - 1);
      case Direction.Down:
        return new Coord(this.board.config.length - 1, coord.col);
      case Direction.Left:
        return new Coord(coord.row, 0);
    }
  }

  // String builder helpers
  private boardRowToString(row: number): string {
    const rowHeaderDivider = '----|---------------------------------|----';

    if (row === -1) {
      return this.endRowToString(row) + '\n' + rowHeaderDivider;
    }
    if (row === this.board.config.length) {
      return rowHeaderDivider + '\n' + this.endRowToString(row);
    }
    return this.middleRowToString(row);
  }

  private endRowToString(row: number): string {
    const prizeStrings =
      this.prizeStrings(row, [...Array(this.board.config.length).keys()]);
    return `[*] | ${prizeStrings.join(' ')} | [*]`;
  }

  private middleRowToString(row: number): string {
    const prizeStrings = this.prizeStrings(row, [-1, this.board.config.length]);
    const bronzorStrings = this.bronzorStrings(row);
    return `${prizeStrings[0]} | ${bronzorStrings.join(' ')} | ${prizeStrings[1]}`;
  }

  private prizeStrings(row: number, cols: Array<number>): Array<string> {
    const coords = cols.map(col => new Coord(row, col));
    const prizeIdxs = coords.map(coord => this.prizeTileId(coord));
    const prizes = prizeIdxs.map(prizeIdx => this.board.prizes[prizeIdx]);
    return prizes.map(prize =>
      (prize !== undefined) ? `[${getPrizeTextMini(prize.prize)}]` : '[ ]'
    );
  }

  private bronzorStrings(row: number): Array<string> {
    const coords = [...Array(this.board.config.length).keys()]
      .map(col => new Coord(row, col));
    const bronzors = coords.map(coord => this.getBronzor(coord));
    return bronzors.map(bronzor =>
      (bronzor !== undefined) ? '[B]' : '[ ]'
    );
  }
}
