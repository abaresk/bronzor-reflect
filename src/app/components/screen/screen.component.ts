import { Component, OnInit } from '@angular/core';
import { BOARD_CONFIG } from '../../common/config';
import { GameService } from '../../services/game/game.service';
import { BoardComponent } from '../board/board.component';
import { LevelComponent } from '../level/level.component';
import { WalletComponent } from '../wallet/wallet.component';
import { InventoryComponent } from '../inventory/inventory.component';
import { ControlPanelComponent } from '../control-panel/control-panel.component';

@Component({
  selector: 'game-screen',
  standalone: true,
  imports: [
    BoardComponent,
    ControlPanelComponent,
    InventoryComponent,
    LevelComponent,
    WalletComponent,
  ],
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
