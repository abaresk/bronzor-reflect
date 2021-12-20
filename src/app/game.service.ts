import { Injectable } from '@angular/core';
import { Beam, BeamPrize, Prize, beamPrizePayouts, inventoryPrizePayouts, jackpotPayouts, moneyPrizePayouts, MoneyPrize, MoneyPrizeType, InventoryPrize } from './prizes';
import { BeamPointType, BoardConfig } from './board';
import { BoardService } from './board.service';
import { Game } from './game';
import { Coord, Vector } from './coord';
import { WalletService } from './wallet.service';
import { InventoryService } from './inventory.service';
import { GeneratorService } from './generator.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  game = {} as Game;

  constructor(
    private generatorService: GeneratorService,
    private boardService: BoardService,
    private walletService: WalletService,
    private inventoryService: InventoryService) { }

  newGame(boardConfig: BoardConfig, credit: number) {
    const level = 1;
    this.walletService.new(credit);
    this.game = {
      config: boardConfig,
      level: level,
      roundsCount: 0,
    };
    this.newRound(level);
  }

  fireBeam(beam: Beam, coord: Coord) {
    const beamPath = this.boardService.fireBeam(beam, coord);
    if (!beamPath) return;

    // Find prize at emission coordinate
    const emitPoint = beamPath.path[beamPath.path.length - 1];
    if (emitPoint.type !== BeamPointType.Emit) return;

    const prizeState = this.boardService.getPrizeState(emitPoint.coord);
    if (!prizeState || prizeState.taken) return;

    this.applyPrize(beam, prizeState.prize);
    this.tryNextLevel(prizeState.prize);
  }

  private newRound(level: number) {
    this.generatorService.generateBoard(this.game.config, level);
    this.inventoryService.new(level);
    this.game.roundsCount++;
  }

  // TODO: Implement round/turn logic.
  //
  // How a round works:
  //  - Do turns until you end the round or the round gets ended.
  //     - Round ends automatically if:
  //        - Hit a bomb
  //        - No more beams in inventory
  //        - No more positive prizes on the board
  //     - You can optionally move to next round if:
  //        - You have gotten the jackpot this round
  //   - You collect the payout at the end of the round.
  //
  // How a turn works:
  //  - Optionally progress to next round, if possible.
  //  - Select a beam from inventory.
  //  - Place the beam on the board.
  //  - Fire the beam.
  //  - Obtain prize.

  // Doing a turn -- solutions:
  //   1. Have a SelectionService, which reports selections made by the user.
  //      Await an async function with the selection made by the user, then 
  //      progress to the corresponding state.
  //   2. Continuously poll the selection status for each relevant component - 
  //      lol

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
      const payout = (inventoryPrizePayouts.get(inventoryPrize) ?? 0) * payoutFactor;
      this.inventoryService.addBeams(Beam.Normal, payout);
      return;
    }

    const beamPrize = prize as BeamPrize;
    if (beamPrize) {
      const payout = (beamPrizePayouts.get(beamPrize) ?? 0) * payoutFactor;
      this.inventoryService.addBeams(beamPrize.type, payout);
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
