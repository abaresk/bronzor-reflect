import { Injectable } from '@angular/core';
import { Beam, Prize, PrizeState } from '../../prizes';
import { BeamPath, BeamPoint, BeamPointType, Board, BoardConfig, BoardHistory, Bronzor } from '../../board';
import { coordInDirection, directions, distanceInDirection, oppositeDir, projectToCoord, rotateClockwise, Coord, Direction, Grid, LineSegment, Vector } from '../../coord';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  board: Board = {} as Board;
  grid: Grid = {} as Grid;

  constructor() { }

  new(board: Board) {
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

  addPrize(coord: Coord, prize: Prize) {
    const prizeTileId = this.prizeTileId(coord);
    if (prizeTileId !== -1) {
      this.board.prizes[prizeTileId] = { prize: prize, taken: false };
    }
  }

  takePrizeAt(coord: Coord) {
    const prizeTileId = this.prizeTileId(coord);
    this.board.prizes[prizeTileId].taken = true;
  }

  private generatePath(beam: Beam, coord: Coord, dryRun: boolean): BeamPath {
    // Place the first coordinate just outside the board. This allows
    // collision detection to work when a Bronzor is on the board edge.
    const firstVector = this.initialVector(coord);
    let firstCoord = firstVector.coord;

    const entry: BeamPoint = { type: BeamPointType.Entry, coord: firstCoord };
    const beamPath: BeamPath = { type: beam, path: [entry] };

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

    if (this.edgeReflectionInCoords(vector, closestBronzors)) {
      const beamPoint: BeamPoint = { type: BeamPointType.Emit, coord: vector.coord };
      beamPath.path.push(beamPoint);
      return undefined;
    }

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
        const checkCoord = vector.coord.coordAt(perpendicular, i);
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
    const destroy = beamPath.type === Beam.Flame;
    const phase = beamPath.type === Beam.Phase;

    if (phase) {
      beamPath.path.push({ type: BeamPointType.Phase, coord: bronzor.coord });
      return { coord: bronzor.coord, dir: vector.dir };
    } else if (destroy) {
      if (!dryRun) bronzor.active = false;
      beamPath.path.push({ type: BeamPointType.Destroy, coord: bronzor.coord });
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

  private edgeReflectionInCoords(vector: Vector, bronzors: Array<Bronzor>): boolean {
    const coords = bronzors.map((bronzor) => bronzor.coord);
    for (let coord of coords) {
      if (this.edgeReflection(vector, coord)) return true;
    }
    return false;
  }

  private edgeReflection(vector: Vector, coord: Coord): boolean {
    // Vector initially starts off the board, so move it onto the board to
    // check if it's on the edge.
    const onBoard = vector.coord.coordAt(vector.dir, 1);

    const edgeDirection = this.onSameEdge(onBoard, coord);
    if (edgeDirection === undefined) return false;

    const perpendicular = rotateClockwise(edgeDirection, 1);
    const distance = distanceInDirection(onBoard, coord, perpendicular);
    return Math.abs(distance) === 1;
  }

  // Return the prize tile ID at the specified coordinate, or -1 if `coord` 
  // doesn't correspond to a prize tile.
  private prizeTileId(coord: Coord): number {
    const edgeSegments = this.grid.edgeSegments(1);
    for (let i = 0; i < directions.length; i++) {
      const index = edgeSegments[i].indexOf(coord);

      if (index !== -1) return i * directions.length + index;
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

  // Returns the direction of the edge the coordinates share, or undefined if
  // they are not on the same edge.
  private onSameEdge(coord1: Coord, coord2: Coord): Direction | undefined {
    for (let dir of directions) {
      if (this.onBoardEdge(coord1, dir) && this.onBoardEdge(coord2, dir)) {
        return dir;
      }
    }
    return undefined;
  }

  // Returns true if the coordinate is on the `direction`-most edge of the 
  // board (e.g. `Up`-most edge or `Right`-most edge).
  private onBoardEdge(coord: Coord, dir: Direction): boolean {
    switch (dir) {
      case Direction.Up:
        return coord.row === 0;
      case Direction.Right:
        return coord.col === this.board.config.length - 1;
      case Direction.Down:
        return coord.row === this.board.config.length - 1;
      case Direction.Left:
        return coord.col === 0;
    }
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
}
