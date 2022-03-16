import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BoardGame } from 'src/app/core/board-game';
import { Move } from 'src/app/common/moves';
import { Coord } from '../../common/geometry/coord';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  boardGame: BoardGame = {} as BoardGame;
  moves: Move[] = [];
  selectionResolve?: (coord: Coord) => void;
  boardGameSubject: Subject<BoardGame>;
  movesSubject: Subject<Move[]>;
  revealHiddenBronzorSubject: Subject<boolean>;

  constructor() {
    this.boardGameSubject = new Subject<BoardGame>();
    this.movesSubject = new Subject<Move[]>();
    this.revealHiddenBronzorSubject = new Subject<boolean>();
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

  async waitForSelection(): Promise<Coord> {
    return new Promise((resolve) => {
      this.selectionResolve = resolve;
    });
  }

  selectFiringCoord(coord: Coord) {
    if (!this.selectionResolve) return;

    this.selectionResolve(coord);
  }

  showHiddenBronzors(value: boolean): void {
    this.revealHiddenBronzorSubject.next(value);
  }

  // Returns true if the given input tile has already been selected by the user.
  private inputTileSelected(coord: Coord): boolean {
    for (let move of this.moves) {
      if (move.coord.equals(coord)) return true;
    }
    return false;
  }
}
