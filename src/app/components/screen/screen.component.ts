import { Component, OnInit } from '@angular/core';
import { BoardConfig } from 'src/app/board';
import { GameService } from 'src/app/services/game/game.service';

const BOARD_CONFIG: BoardConfig = { bronzorCount: 4, length: 8 };

@Component({
  selector: 'game-screen',
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.scss']
})
export class ScreenComponent implements OnInit {

  constructor(private gameService: GameService) {
    this.gameService.newGame(BOARD_CONFIG, 300);
  }

  ngOnInit(): void {
    this.gameService.play();
  }

}
