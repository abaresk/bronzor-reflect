import { Component, OnInit } from '@angular/core';
import { BOARD_CONFIG } from 'src/app/common/config';
import { GameService } from 'src/app/services/game/game.service';

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
