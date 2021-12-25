import { Injectable } from '@angular/core';
import { Beam, Prize, jackpotPayouts, MoneyPrize, InventoryPrize, prizePayouts, Bomb, triggersBomb, positivePrize } from '../../common/prizes';
import { BeamPath, BeamPointType, BoardConfig } from '../../board';
import { BoardGameService } from '../board-game/board-game.service';
import { Game } from '../../game';
import { Coord, Vector } from '../../common/coord';
import { WalletService } from '../wallet/wallet.service';
import { InventoryService } from '../inventory/inventory.service';
import { GeneratorService } from '../generator/generator.service';
import { BoardService } from '../board/board.service';

interface BeamPrize {
  beam: Beam;
  prize?: Prize;
};

interface Move {
  beam: Beam;
  coord: Coord;
  beamPath: BeamPath
};

@Injectable({
  providedIn: 'root'
})
export class GameService {
  game = {} as Game;
  moves: Move[] = [];
  wonJackpot: boolean = false;
  bombExploded: boolean = false;

  constructor(
    private generatorService: GeneratorService,
    private boardGameService: BoardGameService,
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
  }

  async play(): Promise<void> {
    while (true) {
      await this.doRound();
    }
  }

  // The user manually decides to end the round.
  //
  // TODO: Implement this method.
  endRound(): void { }

  private async doRound(): Promise<void> {
    this.newRound(this.game.level);
    let beamPrize = await this.doTurn();
    while (beamPrize && !this.roundOver(beamPrize)) {
      beamPrize = await this.doTurn();
    }

    const nextLevel = this.nextLevel();
    await this.walletService.mergeFunds();
    this.game.level = nextLevel;
  }

  private newRound(level: number) {
    this.game.level = level;
    this.generatorService.generateBoard(this.game.config, level);
    this.inventoryService.new(level);
    this.moves = [];
    this.game.roundsCount++;
    this.wonJackpot = false;
    this.bombExploded = false;
  }

  private async doTurn(): Promise<BeamPrize | undefined> {
    const move = await this.doMove();
    if (!move) return;

    this.moves.push(move);

    const prize = this.getPrize(move);
    if (!prize) return { beam: move.beam };

    this.applyPrize(move.beam, prize);
    return { beam: move.beam, prize: prize };
  }

  // Returns true if the round should end automatically. This happens if:
  //  - Player hit a bomb
  //  - No more beams in inventory
  //  - No more positive prizes on the board
  private roundOver(beamPrize: BeamPrize): boolean {
    if (Object.values(Bomb).includes(beamPrize.prize as Bomb) &&
      triggersBomb(beamPrize.beam)) return true;

    if (!this.inventoryService.anyBeams()) return true;

    const remainingPrizes = this.boardGameService.remainingPrizes();
    const remainingGoodPrizes = remainingPrizes
      .filter((prize) => { return positivePrize(prize) });
    return remainingGoodPrizes.length === 0;
  }

  private async doMove(): Promise<Move | undefined> {
    const beam = await this.inventoryService.getSelection();
    const coord = await this.boardService.getSelection();

    // Selections are final. Decrement inventory, clear selection state and fire
    // the beam.
    this.inventoryService.addBeams(beam, -1);
    this.clearSelections();

    const beamPath = this.boardGameService.fireBeam(beam, coord);
    if (!beamPath) return undefined;

    return { beam: beam, coord: coord, beamPath: beamPath };
  }

  // Gets the prize the user wins as a result of `move`, or undefined if the
  // user does not win a prize.
  private getPrize(move: Move): Prize | undefined {
    // Find prize at emission coordinate
    const emitPoint = move.beamPath.path[move.beamPath.path.length - 1];
    if (emitPoint.type !== BeamPointType.Emit) return undefined;

    if (this.prizeBlocked(emitPoint.coord)) return undefined;

    const prizeState = this.boardGameService.getPrizeState(emitPoint.coord);
    if (!prizeState || prizeState.taken) return undefined;

    this.boardGameService.takePrizeAt(emitPoint.coord);
    return prizeState.prize;
  }

  // Returns true if a placed Pokémon is blocking the prize at the given
  // `coord`.
  private prizeBlocked(coord: Coord): boolean {
    for (let move of this.moves) {
      if (move.coord.equals(coord)) return true;
    }
    return false;
  }

  private applyPrize(beam: Beam, prize: Prize) {
    const payoutFactor = beam === Beam.DoublePrize ? 2 : 1;

    if (prize === MoneyPrize.Jackpot) {
      this.wonJackpot = true;
      const payout = (jackpotPayouts.get(this.game.level) ?? 0) * payoutFactor;
      this.walletService.addToPayout(payout);
      return;
    }

    const payout = (prizePayouts.get(prize.toString()) ?? 0) * payoutFactor;
    if (Object.values(MoneyPrize).includes(prize as MoneyPrize)) {
      this.walletService.addToPayout(payout);
    } else if (Object.values(InventoryPrize).includes(prize as InventoryPrize)) {
      this.inventoryService.addBeams(Beam.Normal, payout);
    } else if (Object.values(Beam).includes(prize as Beam)) {
      this.inventoryService.addBeams(prize as Beam, payout);
    } else if (Object.values(Bomb).includes(prize as Bomb) && triggersBomb(beam)) {
      this.bombExploded = true;
      this.walletService.setPayout(0);
    }
  }

  // TODO: Decide how to compute next level.
  private nextLevel(): number {
    if (this.walletService.getPayout() === 0) {
      return Math.max(this.game.level - 1, 1);
    }

    if (!this.bombExploded && this.wonJackpot) {
      return Math.min(this.game.level + 1, 8);
    }

    return this.game.level;
  }

  private clearSelections(): void {
    this.inventoryService.clearSelection();
    this.boardService.clearSelection();
  }
}
