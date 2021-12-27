import { Component, OnInit } from '@angular/core';
import { Cell, SelectionState } from '../../common/cell';
import { BeamPointType, Board, BoardConfig } from '../../board';
import { Coord } from '../../common/geometry/coord';
import { GameService } from '../../services/game/game.service';
import { BoardService } from 'src/app/services/board/board.service';
import { SelectionFocus } from 'src/app/common/selection-focus';
import { Subscription } from 'rxjs';
import { BoardCell } from './board-cell';
import { BeamMove, CellInput, CellOutput, EmitType, IOCell, IOState, newIOState } from './io-cell';
import { PrizeCell } from './prize-cell';
import { Move } from 'src/app/moves';
import { Grid } from 'src/app/common/geometry/grid';
import { Direction, oppositeDir, rotateClockwise } from 'src/app/common/geometry/direction';

@Component({
  selector: 'game-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  boardLength: number;
  grid: Grid = {} as Grid;
  boardCoords: Array<Array<Coord>> = [[]];
  cells: Map<string, Cell> = new Map();
  prizeCells: Cell[] = [];
  ioCells: IOCell[] = [];
  boardCells: Cell[] = [];
  boardSelectionFocusObservable: Subscription;
  movesObservable: Subscription;
  // The number of rows used to display prizes and income/outcome state.
  outcomeRows: number = 2;

  constructor(
    private gameService: GameService,
    private boardService: BoardService) {
    this.boardLength = this.gameService.game.config.length;
    this.grid = new Grid(this.boardLength, this.boardLength);

    this.boardCoords = this.computeBoardCoords();
    this.boardSelectionFocusObservable =
      boardService.boardSelectionFocusSubject.subscribe(
        (focus) => { this.setSelectionFocus(focus) });
    this.movesObservable = boardService.movesSubject.subscribe(
      (moves) => { this.updateIOCells(moves) });
  }

  ngOnInit(): void {
    this.cells = this.initializeCells(this.boardCoords);
    this.markCornersInvisible();
  }

  getCell(coord: Coord): Cell | undefined {
    return this.cells.get(coord.toString());
  }

  setCell(coord: Coord, cell: Cell) {
    return this.cells.set(coord.toString(), cell);
  }

  getVisible(coord: Coord): boolean {
    return this.getCell(coord)?.visible ?? false;
  }

  selectTile(cell: Cell): void {
    if (cell instanceof IOCell) {
      this.boardService.selectFiringCoord(cell.coord);
    }
  }

  setSelectionFocus(selectionFocus: SelectionFocus): void {
    switch (selectionFocus) {
      case SelectionFocus.Focus:
        this.focus();
        break;
      case SelectionFocus.Unfocus:
        this.unfocus();
        break;
      case SelectionFocus.ClearSelection:
        this.clearSelection();
        break;
    }
  }

  private focus(): void {
    // Make each I/O cell interactable.
    for (let cell of this.ioCells) {
      cell.setInteractability(true);
    }

    // TODO: Automatically focus on the top-left tile.

  }

  private unfocus(): void {
    for (let cell of this.ioCells) {
      cell.setInteractability(false);
    }
  }

  private clearSelection(): void {
    for (let cell of this.ioCells) {
      cell.setInteractability(true);
      cell.setSelectionState(SelectionState.Unselected);
      cell.setInteractability(false);
    }
  }

  private computeBoardCoords(): Array<Array<Coord>> {
    const origin = new Coord(0, 0)
      .coordAt(Direction.Left, this.outcomeRows)
      .coordAt(Direction.Up, this.outcomeRows);
    const totalLength = this.boardLength + 2 * this.outcomeRows;
    const boardCoords = [];

    for (let i = 0; i < totalLength; i++) {
      const start = origin.coordAt(Direction.Down, i);
      boardCoords.push(this.addBoardCoordRow(start, totalLength));
    }

    return boardCoords;
  }

  private addBoardCoordRow(start: Coord, length: number): Array<Coord> {
    const row = [];
    for (let i = 0; i < length; i++) {
      row.push(start.coordAt(Direction.Right, i));
    }
    return row;
  }

  // This might be buggy... We would have to call this method whenever we
  // generate a new board. Maybe that's fine. An ideal solution to keep this in
  // sync might be to use Observables.
  private initializeCells(boardCoords: Array<Array<Coord>>): Map<string, Cell> {
    this.prizeCells = [];
    this.ioCells = [];
    this.boardCells = [];

    const cells = new Map();
    const totalLength = boardCoords.length;
    for (let r = 0; r < boardCoords.length; r++) {
      for (let c = 0; c < boardCoords[0].length; c++) {
        const coord = boardCoords[r][c];
        // Outer-most row
        if (r === 0 || c === 0 || r === totalLength - 1 || c === totalLength - 1) {
          const prizeCoord = this.prizeCellCoord(coord);
          if (prizeCoord) {
            // TODO: Initialize this in the subscriber.
            const cell = new PrizeCell(undefined);
            cells.set(coord.toString(), cell);
            this.prizeCells.push(cell);
          }
        }
        // Second to outer-most row 
        else if (r === 1 || c === 1 || r === totalLength - 2 || c === totalLength - 2) {
          const cell = new IOCell(coord,
            (checkCoord: Coord) => { return this.boardService.validPlacementSelection(checkCoord); });
          cells.set(coord.toString(), cell);
          this.ioCells.push(cell);
        }
        // Inside the cell
        else {
          // TODO: Initialize this in the subscriber.
          const cell = new BoardCell(undefined);
          cells.set(coord.toString(), cell);
          this.boardCells.push(cell);
        }
      }
    }
    return cells;
  }

  private markCornersInvisible() {
    // Make the four corners invisible
    const corners = this.grid.corners();
    let initialDir = Direction.Left;
    for (let i = 0; i < corners.length; i++) {
      this.markCornerInvisible(corners[i], rotateClockwise(initialDir, i));
    }
  }

  private markCornerInvisible(corner: Coord, leftFlank: Direction) {
    for (let i = 0; i < this.outcomeRows; i++) {
      for (let j = 0; j < this.outcomeRows; j++) {
        const invisibleCoord = corner
          .coordAt(leftFlank, i + 1)
          .coordAt(rotateClockwise(leftFlank, 1), j + 1);
        const cell = this.getCell(invisibleCoord);
        if (cell) {
          cell.visible = false;
          this.setCell(invisibleCoord, cell);
        }
      }
    }
  }

  private prizeCellCoord(coord: Coord): Coord | undefined {
    const segmentDir = this.grid.coordInEdgeSegments(coord, 2);
    if (segmentDir === undefined) return;

    return coord.coordAt(oppositeDir(segmentDir), 1);
  }

  private updateIOCells(moves: Move[]): void {
    const inputs: Map<string, CellInput> = new Map();
    const outputs: Map<string, CellOutput> = new Map();
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const beamMove = { beam: move.beam, moveIndex: i };
      const input =
        { beamMove: beamMove, emitType: this.getEmitType(move) };
      inputs.set(move.coord.toString(), input);

      const lastPoint = move.beamPath.path[move.beamPath.path.length - 1];
      if (lastPoint.type === BeamPointType.Emit) {
        const existingOuts = outputs.get(lastPoint.coord.toString()) ?? { outputs: [] };
        existingOuts.outputs.push(beamMove);
        outputs.set(lastPoint.coord.toString(), existingOuts);
      }
    }

    this.clearIOStates();
    this.applyIOStates(inputs, outputs);
  }

  private applyIOStates(inputs: Map<string, CellInput>, outputs: Map<string, CellOutput>): void {
    for (let [coord, input] of inputs) {
      const ioCell = this.cells.get(coord) as IOCell;
      ioCell.ioState.input = input;
    }

    for (let [coord, output] of outputs) {
      const ioCell = this.cells.get(coord) as IOCell;
      ioCell.ioState.output = output;
    }
  }

  private clearIOStates(): void {
    for (let cell of this.ioCells) {
      cell.ioState = newIOState();
    }
  }

  private getEmitType(move: Move): EmitType {
    const firstCoord = move.coord;
    const lastPoint = move.beamPath.path[move.beamPath.path.length - 1];

    if (lastPoint.type === BeamPointType.Hit) return EmitType.Hit;
    if (lastPoint.coord.equals(firstCoord)) return EmitType.Reflect;
    return EmitType.Emit;
  }
}
