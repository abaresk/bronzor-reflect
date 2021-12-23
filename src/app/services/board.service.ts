import { Injectable } from '@angular/core';
import { Coord } from '../common/coord';
import { Beam } from '../common/prizes';
import { BoardGameService } from './board-game/board-game.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(private boardGameService: BoardGameService) { }

  selectFiringCoord(beam: Beam, coord: Coord) {
    this.boardGameService.fireBeam(beam, coord);
  }
}
