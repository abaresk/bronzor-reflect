import { Component, OnInit } from '@angular/core';
import { Cell } from '../../common/cell';
import { BeamPointType, Board, BoardConfig, Bronzor } from '../../board';
import { Coord } from '../../common/geometry/coord';
import { GameService } from '../../services/game/game.service';
import { BoardService } from 'src/app/services/board/board.service';
import { SelectionFocus } from 'src/app/common/selection-focus';
import { filter, Subscription } from 'rxjs';
import { BoardCell } from './board-cell';
import { BeamMove, CellInput, CellOutput, EmitType, IOCell, IOState, newIOState } from './io-cell';
import { PrizeCell } from './prize-cell';
import { Move } from 'src/app/moves';
import { Grid } from 'src/app/common/geometry/grid';
import { Direction, oppositeDir, rotateClockwise } from 'src/app/common/geometry/direction';
import { BoardGame } from 'src/app/core/board-game';
import { InputAdapterService } from 'src/app/services/input-adapter/input-adapter.service';
import { GbaInput, isDpadInput, isHorizontal, isVertical } from 'src/app/services/input-adapter/inputs';

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
  boardCells: BoardCell[] = [];
  prizeCells: PrizeCell[] = [];
  ioCells: IOCell[] = [];
  boardGameObservable: Subscription;
  boardSelectionFocusObservable: Subscription;
  movesObservable: Subscription;
  inputObservable: Subscription;
  revealHiddenBronzorsObservable: Subscription;

  // True if focus is inside the Board.
  focused: boolean = false;
  // The cell in the board that currently has focus. Initially in top-left
  // corner.
  focusedCellCoord: Coord = new Coord(-1, 0);

  // The number of rows used to display prizes and income/outcome state.
  outcomeRows: number = 2;

  constructor(
    private gameService: GameService,
    private boardService: BoardService,
    private inputAdapterService: InputAdapterService) {
    this.boardLength = this.gameService.game.config.length;
    this.grid = new Grid(this.boardLength, this.boardLength);

    this.boardCoords = this.computeBoardCoords();
    this.cells = this.initializeCells(this.boardCoords);
    this.boardGameObservable = boardService.boardGameSubject.subscribe(
      (boardGame) => { this.setupBoard(boardGame) });
    this.boardSelectionFocusObservable =
      boardService.boardSelectionFocusSubject.subscribe(
        (focus) => { this.setSelectionFocus(focus) });
    this.movesObservable = boardService.movesSubject.subscribe(
      (moves) => { this.updateIOCells(moves) });
    this.inputObservable = this.inputAdapterService.inputSubject
      .pipe(filter((value) => isDpadInput(value)))
      .subscribe((input) => { this.handleDpadInput(input); });
    this.revealHiddenBronzorsObservable = boardService.revealHiddenBronzorSubject
      .subscribe((display) => { this.displayHiddenBronzors(display) });
  }

  ngOnInit(): void {
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
    if (cell instanceof BoardCell) {
      cell.toggleMemoState();
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

  // Moves focus into the board component.
  private focus(): void {
    this.focused = true;
    this.updateFocusedCell(this.focusedCellCoord);

    // Make each board cell traversable.
    for (let cell of this.boardCells) {
      cell.traversable = true;
    }

    // Make each I/O cell selectable.
    for (let cell of this.ioCells) {
      cell.traversable = true;
      cell.selectable = true;
    }
  }

  private unfocus(): void {
    this.focused = false;

    for (let cell of this.boardCells) {
      cell.traversable = false;
    }

    for (let cell of this.ioCells) {
      cell.traversable = false;
      cell.selectable = false;
    }
  }

  private clearSelection(): void {
    this.focused = false;

    for (let cell of this.ioCells) {
      cell.traversable = false;
      cell.selectable = false;
      cell.selected = false;
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

  private setupBoard(boardGame: BoardGame): void {
    // Add Bronzors
    this.clearBoardCellStates();
    this.updateBoardCellStates(boardGame);

    // Add prizes
    this.clearPrizeStates();
    this.updatePrizeStates(boardGame);
  }

  private initializeCells(boardCoords: Coord[][]): Map<string, Cell> {
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

  private updateBoardCellStates(boardGame: BoardGame): void {
    for (let bronzor of boardGame.board.bronzors) {
      const boardCell = this.cells.get(bronzor.coord.toString()) as BoardCell;
      boardCell.bronzor = bronzor;
    }
  }

  private updatePrizeStates(boardGame: BoardGame): void {
    for (let i = 0; i < boardGame.board.prizes.length; i++) {
      const prizeState = boardGame.board.prizes[i];
      const prizeCoord = boardGame.getPrizeCoord(i);
      if (prizeState && prizeCoord) {
        const segmentDir = this.grid.coordInEdgeSegments(prizeCoord, 1);
        if (segmentDir !== undefined) {
          const boardCoord = prizeCoord.coordAt(segmentDir, 1);
          const prizeCell = this.cells.get(boardCoord.toString()) as PrizeCell;
          prizeCell.prizeState = prizeState;
        }
      }
    }
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

  private clearBoardCellStates(): void {
    for (let cell of this.boardCells) {
      cell.bronzor = undefined;
    }
  }

  private clearPrizeStates(): void {
    for (let cell of this.prizeCells) {
      cell.prizeState = undefined;
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

    if (lastPoint.type === BeamPointType.Hit ||
      lastPoint.type === BeamPointType.Destroy) return EmitType.Hit;
    if (lastPoint.coord.equals(firstCoord)) return EmitType.Reflect;
    return EmitType.Emit;
  }

  private handleDpadInput(input: GbaInput): void {
    if (!this.focused) return;

    const newCoord = this.shiftedCoord(this.focusedCellCoord, input);
    this.updateFocusedCell(newCoord);
  }

  private shiftedCoord(currentCoord: Coord, input: GbaInput): Coord {
    // Wrap around the grid from the border tiles.
    if (input === GbaInput.Up && currentCoord.row === -1) {
      return new Coord(this.boardLength, currentCoord.col);
    }
    if (input === GbaInput.Down && currentCoord.row === this.boardLength) {
      return new Coord(-1, currentCoord.col);
    }
    if (input === GbaInput.Right && currentCoord.col === this.boardLength) {
      return new Coord(currentCoord.row, -1);
    }
    if (input === GbaInput.Left && currentCoord.col === -1) {
      return new Coord(currentCoord.row, this.boardLength);
    }

    const delta = (input === GbaInput.Right || input === GbaInput.Down) ? 1 : -1;
    let newRow = currentCoord.row;
    let newCol = currentCoord.col;
    if (isVertical(input)) {
      newRow = currentCoord.row + delta;
      // If out of bounds, snap coordinate onto the edge segment.
      if (currentCoord.col === -1 || currentCoord.col === this.boardLength) {
        if (newRow === -1 || newRow === this.boardLength) {
          newCol = (newCol === -1) ? 0 : this.boardLength - 1;
        }
      }
    } else {
      newCol = currentCoord.col + delta;
      // If out of bounds, snap coordinate onto the edge segment.
      if (currentCoord.row === -1 || currentCoord.row === this.boardLength) {
        if (newCol === -1 || newCol === this.boardLength) {
          newRow = (newRow === -1) ? 0 : this.boardLength - 1;
        }
      }
    }

    return new Coord(newRow, newCol);
  }

  private updateFocusedCell(newCoord: Coord) {
    // Remove focus from current cell.
    if (this.focusedCellCoord) {
      const currentCell = this.cells.get(this.focusedCellCoord.toString());
      if (currentCell) {
        currentCell.focused = false;
      }
    }

    const newCell = this.cells.get(newCoord.toString());
    if (newCell) {
      newCell.focused = true;
      this.focusedCellCoord = newCoord;
    }
  }

  private displayHiddenBronzors(display: boolean) {
    for (let cell of this.boardCells) {
      cell.setRevealHidden(display);
    }
  }
}
