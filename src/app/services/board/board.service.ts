import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SelectionFocus } from 'src/app/common/selection-focus';
import { Move } from 'src/app/moves';
import { Board } from '../../board';
import { Coord } from '../../common/coord';
import { BoardGameService } from '../board-game/board-game.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  board: Board = {} as Board;
  selectionResolve?: (coord: Coord) => void;
  boardSelectionFocusSubject: Subject<SelectionFocus>;
  movesSubject: Subject<Move[]>;

  constructor(private boardGameService: BoardGameService) {
    // Alias the board for easier referencing
    this.board = this.boardGameService.board;

    this.boardSelectionFocusSubject = new Subject<SelectionFocus>();
    this.movesSubject = new Subject<Move[]>();
  }

  updateMoves(moves: Move[]): void {
    this.movesSubject.next(moves);
  }

  async getSelection(): Promise<Coord> {
    this.setSelectionFocus(SelectionFocus.Focus);
    const selection = await this.waitForSelection();
    this.setSelectionFocus(SelectionFocus.Unfocus);

    return selection;
  }

  clearSelection(): void {
    this.setSelectionFocus(SelectionFocus.ClearSelection);
  }

  private setSelectionFocus(selectionFocus: SelectionFocus) {
    this.boardSelectionFocusSubject.next(selectionFocus);
  }

  private async waitForSelection(): Promise<Coord> {
    return new Promise((resolve) => {
      this.selectionResolve = resolve;
    });
  }

  selectFiringCoord(coord: Coord) {
    if (!this.selectionResolve) return;

    this.selectionResolve(coord);
  }
}
