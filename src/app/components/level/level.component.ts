import { Component, OnInit } from '@angular/core';
import { hiddenBronzorsByLevel } from 'src/app/data/generator-tables';
import { GameService } from 'src/app/services/game/game.service';

@Component({
  selector: 'game-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss']
})
export class LevelComponent implements OnInit {

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }

  getHiddenBronzors(): string {
    const count = hiddenBronzorsByLevel.get(this.gameService.game.level);
    if (count === undefined) return 'n/a';

    return count.toString();
  }
}
