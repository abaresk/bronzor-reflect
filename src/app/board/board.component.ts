import { BoardCell, Cell, IOCell, PrizeCell } from '../cell';
import { Component, OnInit } from '@angular/core';
import { Beam } from '../items';
import { Board, BoardConfig } from '../board';
import { BoardService } from '../board.service';
import { Coord, Direction, Grid, rotateClockwise } from '../coord';
import { GameService } from '../game.service';

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

  // The number of rows used to display prizes and income/outcome state.
  outcomeRows: number = 2;

  constructor(private gameService: GameService, private boardService: BoardService) {
    // Alias the board for easier referencing
    this.board = this.boardService.board;

    this.grid = new Grid(this.boardConfig.length, this.boardConfig.length);

    this.boardCoords = this.computeBoardCoords();
  }

  ngOnInit(): void {
    this.gameService.newGame(this.boardConfig, 300);
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
    const cells = new Map();
    const totalLength = boardCoords.length;
    for (let r = 0; r < boardCoords.length; r++) {
      for (let c = 0; c < boardCoords[0].length; c++) {
        const coord = boardCoords[r][c];
        // Outer-most row
        if (r === 0 || c === 0 || r === totalLength - 1 || c === totalLength - 1) {
          cells.set(coord.toString(),
            new PrizeCell(this.boardService.getPrizeState(coord)));
        }
        // Second to outer-most row 
        else if (r === 1 || c === 1 || r === totalLength - 2 || c === totalLength - 2) {
          cells.set(coord.toString(), new IOCell());
        }
        // Inside the cell
        else {
          cells.set(coord.toString(),
            new BoardCell(this.boardService.getBronzor(coord)));
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
}
