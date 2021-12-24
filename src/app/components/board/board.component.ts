import { BoardCell, Cell, IOCell, PrizeCell, SelectionState } from '../cell/cell';
import { Component, OnInit } from '@angular/core';
import { Beam } from '../../common/prizes';
import { Board, BoardConfig } from '../../board';
import { Coord, Direction, Grid, oppositeDir, rotateClockwise } from '../../common/coord';
import { GameService } from '../../services/game/game.service';
import { BoardService } from 'src/app/services/board/board.service';
import { BoardGameService } from 'src/app/services/board-game/board-game.service';
import { SelectionFocus } from 'src/app/common/selection-focus';
import { Subscription } from 'rxjs';

@Component({
  selector: 'game-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  board: Board = {} as Board;
  grid: Grid;
  boardConfig: BoardConfig = { bronzorCount: 4, length: 8 };
  boardCoords: Array<Array<Coord>> = [[]];
  cells: Map<string, Cell> = new Map();
  prizeCells: Cell[] = [];
  ioCells: Cell[] = [];
  boardCells: Cell[] = [];
  boardSelectionFocusObservable: Subscription;
  // The number of rows used to display prizes and income/outcome state.
  outcomeRows: number = 2;

  constructor(
    private gameService: GameService,
    private boardService: BoardService,
    private boardGameService: BoardGameService) {
    // Alias the board for easier referencing
    this.board = this.boardService.board;

    this.grid = new Grid(this.boardConfig.length, this.boardConfig.length);

    this.boardCoords = this.computeBoardCoords();
    this.boardSelectionFocusObservable =
      boardService.boardSelectionFocusSubject.subscribe(
        (focus) => { this.setSelectionFocus(focus) });
  }

  ngOnInit(): void {
    this.gameService.newGame(this.boardConfig, 300);
    this.cells = this.initializeCells(this.boardCoords);
    this.markCornersInvisible();
    this.gameService.play();
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
    const totalLength = this.boardConfig.length + 2 * this.outcomeRows;
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
            const cell = new PrizeCell(this.boardGameService.getPrizeState(prizeCoord));
            cells.set(coord.toString(), cell);
            this.prizeCells.push(cell);
          }
        }
        // Second to outer-most row 
        else if (r === 1 || c === 1 || r === totalLength - 2 || c === totalLength - 2) {
          const cell = new IOCell(coord);
          cells.set(coord.toString(), cell);
          this.ioCells.push(cell);
        }
        // Inside the cell
        else {
          const cell = new BoardCell(this.boardGameService.getBronzor(coord));
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
}
