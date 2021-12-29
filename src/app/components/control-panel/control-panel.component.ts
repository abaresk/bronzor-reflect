import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game/game.service';

@Component({
  selector: 'game-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit {

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

  getButtonText(): string {
    return this.gameService.wonAllJackpots() ? 'Next level' : 'End round';
  }

  endRound(): void {
    this.gameService.endRound();
  }
}
