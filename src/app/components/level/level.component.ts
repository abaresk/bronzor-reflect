import { Component, OnInit } from '@angular/core';
import { hiddenBronzorsByLevel } from '../../data/generator-tables';
import { GameService } from '../../services/game/game.service';

@Component({
  selector: 'game-level',
  standalone: true,
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
