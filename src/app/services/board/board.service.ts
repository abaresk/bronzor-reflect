import { Injectable } from '@angular/core';
import { Board } from '../../board';
import { Coord } from '../../common/coord';
import { BoardGameService } from '../board-game/board-game.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  board: Board = {} as Board;

  constructor(private boardGameService: BoardGameService) {
    // Alias the board for easier referencing
    this.board = this.boardGameService.board;
  }

  selectFiringCoord(coord: Coord) {
    // TODO: Pass this up to the GameService so that it can call
    // boardGameService.fireBeam().
  }
}
