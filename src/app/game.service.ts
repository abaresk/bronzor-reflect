import { Injectable } from '@angular/core';
import { Beam, BeamPrize, Prize, beamPrizePayouts, inventoryPrizePayouts, jackpotPayouts, moneyPrizePayouts, MoneyPrize, MoneyPrizeType, InventoryPrize } from './items';
import { BeamPointType, BoardConfig } from './board';
import { BoardService } from './board.service';
import { Game, Inventory } from './game';
import { Vector } from './coord';
import { Wallet } from './wallet';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  game = {} as Game;

  constructor(
    private boardService: BoardService,
    private walletService: WalletService) { }

  newGame(boardConfig: BoardConfig, credit: number) {
    const level = 1;
    this.boardService.new(boardConfig, level);
    this.walletService.new(credit);
    const inventory: Inventory = { beams: new Map() };
    this.game = {
      config: boardConfig,
      board: this.boardService.board,
      level: level,
      inventory: inventory,
    };
  }

  fireBeam(beam: Beam, vector: Vector) {
    const beamPath = this.boardService.fireBeam(beam, vector);
    if (!beamPath) return;

    // Find prize at emission coordinate
    const emitPoint = beamPath.path[beamPath.path.length - 1];
    if (emitPoint.type !== BeamPointType.Emit) return;

    const prizeState = this.boardService.getPrizeState(emitPoint.coord);
    if (!prizeState || prizeState.taken) return;

    this.applyPrize(beam, prizeState.prize);
    this.tryNextLevel(prizeState.prize);
  }

  private applyPrize(beam: Beam, prize: Prize) {
    const payoutFactor = beam === Beam.DoublePrize ? 2 : 1;

    const moneyPrize = prize as MoneyPrize;
    if (moneyPrize) {
      if (prize.type === MoneyPrizeType.Jackpot) {
        const payout = (jackpotPayouts.get(this.game.level) ?? 0) * payoutFactor;
        this.walletService.setPayout(payout);
        return;
      }

      const payout = (moneyPrizePayouts.get(moneyPrize) ?? 0) * payoutFactor;
      this.walletService.setPayout(payout);
      return;
    }


    const inventoryPrize = prize as InventoryPrize;
    if (inventoryPrize) {
      const oldBeams = this.game.inventory.beams.get(Beam.Normal) ?? 0;
      const payout = (inventoryPrizePayouts.get(inventoryPrize) ?? 0) * payoutFactor;
      this.game.inventory.beams.set(Beam.Normal, oldBeams + payout);
      return;
    }

    const beamPrize = prize as BeamPrize;
    if (beamPrize) {
      const oldBeams = this.game.inventory.beams.get(beamPrize.type) ?? 0;
      const payout = (beamPrizePayouts.get(beamPrize) ?? 0) * payoutFactor;
      this.game.inventory.beams.set(beamPrize.type, oldBeams + payout);
      return;
    }
  }

  private tryNextLevel(prize: Prize) {
    const moneyPrize = prize as MoneyPrize;
    if (moneyPrize && moneyPrize.type === MoneyPrizeType.Jackpot) {
      this.game.level = Math.min(this.game.level + 1, 8);
      return;
    }

    // TODO: Maybe this should decrease only if you didn't receive any positive
    // prizes (i.e., check inventory too).
    if (this.walletService.getPayout() === 0) {
      this.game.level = Math.max(this.game.level - 1, 1);
    }
  }
}
