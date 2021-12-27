import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SelectionFocus } from 'src/app/common/selection-focus';
import { BoardGame } from 'src/app/core/board-game';
import { Move } from 'src/app/moves';
import { Board } from '../../board';
import { Coord } from '../../common/geometry/coord';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  boardGame: BoardGame = {} as BoardGame;
  moves: Move[] = [];
  selectionResolve?: (coord: Coord) => void;
  boardGameSubject: Subject<BoardGame>;
  boardSelectionFocusSubject: Subject<SelectionFocus>;
  movesSubject: Subject<Move[]>;

  constructor() {
    this.boardGameSubject = new Subject<BoardGame>();
    this.boardSelectionFocusSubject = new Subject<SelectionFocus>();
    this.movesSubject = new Subject<Move[]>();
  }

  updateBoardGame(boardGame: BoardGame) {
    this.boardGame = boardGame;
    this.boardGameSubject.next(boardGame);
  }

  updateMoves(moves: Move[]): void {
    this.moves = moves;
    this.movesSubject.next(moves);
  }

  validPlacementSelection(coord: Coord): boolean {
    return !this.inputTileSelected(coord);
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

  // Returns true if the given input tile has already been selected by the user.
  private inputTileSelected(coord: Coord): boolean {
    for (let move of this.moves) {
      if (move.coord.equals(coord)) return true;
    }
    return false;
  }
}
