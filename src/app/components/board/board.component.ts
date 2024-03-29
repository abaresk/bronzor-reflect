import { Component, OnInit } from '@angular/core';
import { Cell } from '../../common/cell';
import { BeamPointType, Board, BoardConfig, Bronzor } from '../../common/board';
import { Coord } from '../../common/geometry/coord';
import { CellComponent } from '../../components/cell/cell.component';
import { GameService, GameState } from '../../services/game/game.service';
import { BoardService } from '../../services/board/board.service';
import { filter, Subscription } from 'rxjs';
import { BoardCell } from './board-cell';
import { BeamMove, CellInput, CellOutput, EmitType, IOCell, IOState, newIOState } from './io-cell';
import { PrizeCell } from './prize-cell';
import { Move } from '../../common/moves';
import { Grid } from '../../common/geometry/grid';
import { Direction, oppositeDir, rotateClockwise } from '../../common/geometry/direction';
import { BoardGame } from '../../core/board-game';
import { Focus, GameComponent, FocusService } from '../../services/focus/focus.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'game-board',
  standalone: true,
  imports: [CellComponent, NgFor],
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
  movesObservable: Subscription;
  focusObservable: Subscription;
  gameStateObservable: Subscription;
  revealHiddenBronzorsObservable: Subscription;

  // The coord of the cell with focus or undefined if board doesn't have focus.
  focusedCellCoord?: Coord;

  // The number of rows used to display prizes and income/outcome state.
  outcomeRows: number = 2;

  constructor(
    private gameService: GameService,
    private boardService: BoardService,
    private focusService: FocusService) {
    this.boardLength = this.gameService.game.config.length;
    this.grid = new Grid(this.boardLength, this.boardLength);

    this.boardCoords = this.computeBoardCoords();
    this.cells = this.initializeCells(this.boardCoords);
    this.boardGameObservable = boardService.boardGameSubject.subscribe(
      (boardGame) => { this.setupBoard(boardGame) });
    this.movesObservable = boardService.movesSubject.subscribe(
      (moves) => { this.updateIOCells(moves) });
    this.focusObservable = this.focusService.focusSubject
      .subscribe((focus) => { this.handleFocus(focus) });
    this.gameStateObservable = this.gameService.gameStateSubject
      .subscribe((state) => { this.handleGameState(state); })
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
      cell.select();
    }
  }

  private handleFocus(focus: Focus): void {
    if (focus.component !== GameComponent.BoardComponent) {
      this.updateFocusedCell(undefined);
      return;
    }

    this.updateFocusedCell(focus.coord);
  }

  private handleGameState(state: GameState): void {
    switch (state) {
      case GameState.SelectItem:
        this.displaySelectItem();
        break;
      case GameState.SelectFiringPlace:
        this.displaySelectFiringPlace();
        break;
      case GameState.FireBeam:
        this.clearSelection();
        break;
      case GameState.RoundEnd:
        this.clearBoard();
        break;
    }
  }

  private displaySelectItem(): void {
    // Make each board cell traversable and selectable.
    for (let cell of this.boardCells) {
      cell.traversable = true;
      cell.selectable = true;
    }

    // Make each I/O cell traversable.
    for (let cell of this.ioCells) {
      cell.traversable = true;
    }
  }

  private displaySelectFiringPlace(): void {
    // Make each board cell traversable.
    for (let cell of this.boardCells) {
      cell.traversable = true;
      cell.selectable = false;
      cell.selected = false;
    }

    // Make each I/O cell selectable.
    for (let cell of this.ioCells) {
      cell.traversable = true;
      cell.selectable = true;
      cell.selected = false;
    }
  }

  private clearSelection(): void {
    for (let cell of this.boardCells) {
      cell.traversable = false;
      cell.selectable = false;
      cell.selected = false;
    }

    for (let cell of this.ioCells) {
      cell.traversable = false;
      cell.selectable = false;
      cell.selected = false;
    }
  }

  private clearBoard(): void {
    for (let cell of this.boardCells) {
      cell.clearMemoState();
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

  private updateFocusedCell(newCoord?: Coord) {
    // Remove focus from current cell.
    if (this.focusedCellCoord) {
      const currentCell = this.cells.get(this.focusedCellCoord.toString());
      if (currentCell) {
        currentCell.focused = false;
      }
    }

    if (newCoord) {
      const newCell = this.cells.get(newCoord.toString());
      if (newCell) {
        newCell.focused = true;
      }
    }

    this.focusedCellCoord = newCoord;
  }

  private displayHiddenBronzors(display: boolean) {
    for (let cell of this.boardCells) {
      cell.setRevealHidden(display);
    }
  }
}
