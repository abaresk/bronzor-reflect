import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SelectionFocus } from 'src/app/common/selection-focus';
import { Board } from '../../board';
import { Coord } from '../../common/coord';
import { BoardGameService } from '../board-game/board-game.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  board: Board = {} as Board;
  boardSelectionFocusSubject: Subject<SelectionFocus>;

  constructor(private boardGameService: BoardGameService) {
    // Alias the board for easier referencing
    this.board = this.boardGameService.board;

    this.boardSelectionFocusSubject = new Subject<SelectionFocus>();
  }

  setSelectionFocus(selectionFocus: SelectionFocus) {
    this.boardSelectionFocusSubject.next(selectionFocus);
  }

  selectFiringCoord(coord: Coord) {
    // TODO: Pass this up to the GameService so that it can call
    // boardGameService.fireBeam().
  }
}
