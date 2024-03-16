import { Injectable } from '@angular/core';
import { detonatesBomb, positivePrize, PrizeStateType, defusesBomb } from '../../common/prizes';
import { BeamPointType, BoardConfig } from '../../common/board';
import { Game } from '../../common/game';
import { Coord } from '../../common/geometry/coord';
import { WalletService } from '../wallet/wallet.service';
import { InventoryService } from '../inventory/inventory.service';
import { GeneratorService } from '../generator/generator.service';
import { BoardService } from '../board/board.service';
import { Move } from '../../common/moves';
import { BoardGame } from '../../core/board-game';
import { InputAdapterService } from '../input-adapter/input-adapter.service';
import { GbaInput } from '../input-adapter/inputs';
import { Subject } from 'rxjs';
import { sleepTicks } from '../../util/timing';
import { Beam, bombEffectRange } from '../../parameters/beams';
import { Bomb, InventoryPrize, MoneyPrize, Prize, jackpotPayout, jackpotPrize, normalBomb, prizePayouts } from '../../parameters/prizes';

interface BeamPrize {
  beam: Beam;
  prize?: Prize;
};

export enum GameState {
  SelectItem,
  SelectFiringPlace,
  FireBeam,
  Payout,
  RoundEnd,
};

@Injectable({
  providedIn: 'root'
})
export class GameService {
  game = {} as Game;
  boardGame: BoardGame = {} as BoardGame;
  moves: Move[] = [];
  gameState: GameState = GameState.SelectItem;
  doRoundResolve?: () => void;
  jackpotsCollected = 0;
  totalJackpots = 0;
  bombExploded: boolean = false;

  gameStateSubject: Subject<GameState>;

  constructor(
    private generatorService: GeneratorService,
    private boardService: BoardService,
    private walletService: WalletService,
    private inventoryService: InventoryService,
    private inputAdapterService: InputAdapterService) {
    this.gameStateSubject = new Subject<GameState>();
  }

  newGame(boardConfig: BoardConfig, credit: number) {
    const level = 1;
    this.walletService.new(credit);
    this.game = {
      config: boardConfig,
      level: level,
      roundsCount: 0,
    };
  }

  private newRound(level: number) {
    this.game.level = level;
    this.game.roundsCount++;

    const board = this.generatorService.generateBoard(this.game.config, level);
    this.boardGame = new BoardGame(board);
    this.boardService.updateBoardGame(this.boardGame);

    this.inventoryService.new(level);
    this.moves = [];
    this.boardService.updateMoves(this.moves);
    this.jackpotsCollected = 0;
    this.totalJackpots = this.boardGame.numPrizes(jackpotPrize);
    this.bombExploded = false;
    this.boardService.showHiddenBronzors(false);
  }

  async play(): Promise<void> {
    while (true) {
      await this.doRound();

      // Reveal hidden Bronzors
      this.boardService.showHiddenBronzors(true);

      // Wait for user to continue. Wait a frame so button click doesn't count
      // as `Touch`.
      await sleepTicks(1);
      await this.inputAdapterService.waitForAnyInput(GbaInput.A, GbaInput.Touch);
      await this.cleanupRound();
    }
  }

  // The user manually decides to end the round.
  //
  // User can only end the round while they are selecting an item to use from
  // inventory.
  endRound(): void {
    if (this.gameState !== GameState.SelectItem) return;
    if (!this.doRoundResolve) return;

    this.doRoundResolve();
  }

  private async doRound(): Promise<void> {
    const doRoundInternal = async (resolve: () => void): Promise<void> => {
      this.doRoundResolve = resolve;

      this.newRound(this.game.level);
      let beamPrize = await this.doTurn();
      while (beamPrize && !this.roundOver(beamPrize)) {
        beamPrize = await this.doTurn();
      }

      resolve();
    };

    return new Promise(doRoundInternal.bind(this));
  }

  // The user can access the next level if they have collected all the jackpots
  // on the board.
  wonAllJackpots(): boolean {
    return this.totalJackpots > 0 && this.jackpotsCollected === this.totalJackpots;
  }

  private async doTurn(): Promise<BeamPrize | undefined> {
    const move = await this.doMove();
    if (!move) return;

    this.moves.push(move);
    this.boardService.updateMoves(this.moves);

    // Move onto next turn if the beam didn't get emitted.
    const emitPoint = move.beamPath.path[move.beamPath.path.length - 1];
    if (emitPoint.type !== BeamPointType.Emit) return { beam: move.beam };

    // Update states for any bombs that were detonated / defused.
    const detonatedCoord = this.handleBombInteraction(emitPoint.coord, move.beam);

    const prizeCoord = detonatedCoord ?? emitPoint.coord;
    const prize = this.tryGetPrize(prizeCoord);
    if (!prize) return { beam: move.beam };

    this.applyPrize(move.beam, prize);
    return { beam: move.beam, prize: prize };
  }

  // Returns true if the round should end automatically. This happens if:
  //  - Player hit a bomb
  //  - No more beams in inventory
  //  - No more positive prizes on the board
  private roundOver(beamPrize: BeamPrize): boolean {
    if (Object.values(Bomb).includes(beamPrize.prize as Bomb)) return true;

    if (!this.inventoryService.anyBeams()) return true;

    const remainingPrizes = this.boardGame.remainingPrizes();
    const remainingGoodPrizes = remainingPrizes
      .filter((prize) => { return positivePrize(prize) });
    return remainingGoodPrizes.length === 0;
  }

  private async cleanupRound(): Promise<void> {
    const nextLevel = this.nextLevel();

    this.updateGameState(GameState.Payout);
    await this.walletService.awardPayout();

    this.updateGameState(GameState.RoundEnd);
    this.game.level = nextLevel;
  }

  private async doMove(): Promise<Move | undefined> {
    this.updateGameState(GameState.SelectItem);
    const beam = await this.inventoryService.waitForSelection();

    this.updateGameState(GameState.SelectFiringPlace);
    const coord = await this.boardService.waitForSelection();

    // Selections are final. Decrement inventory, clear selection state and fire
    // the beam.
    this.inventoryService.addBeams(beam, -1);

    // TODO: Figure out where to set this. If other components react to this
    // (e.g. to start animations), then maybe it should be set after the path is
    // computed.
    this.updateGameState(GameState.FireBeam);
    const beamPath = this.boardGame.fireBeam(beam, coord);
    if (!beamPath) return undefined;

    return { beam: beam, coord: coord, beamPath: beamPath };
  }

  private updateGameState(state: GameState): void {
    this.gameState = state;
    this.gameStateSubject.next(state);
  }

  // Returns the coordinate of any detonated bomb, or else undefined.
  private handleBombInteraction(coord: Coord, beam: Beam): Coord | undefined {
    const coordsToCheck =
      this.boardGame.getPrizeCoordsWithinRange(coord, bombEffectRange(beam));
    for (const coord of coordsToCheck) {
      const prizeState = this.boardGame.getPrizeState(coord);
      if (prizeState?.type !== PrizeStateType.Bomb) continue;

      if (this.prizeBlocked(coord)) continue;

      if (defusesBomb(beam)) {
        prizeState.defused = true;
      }
      if (detonatesBomb(beam) && !prizeState.defused) {
        return coord;
      }
    }
    return undefined;
  }

  // Gets the prize at `coord`, or undefined if there is no prize or the prize
  // is blocked.
  private tryGetPrize(coord: Coord): Prize | undefined {
    if (this.prizeBlocked(coord)) return undefined;

    const prizeState = this.boardGame.getPrizeState(coord);
    switch (prizeState?.type) {
      case PrizeStateType.Bomb:
        return (prizeState.defused) ? undefined : prizeState.prize;
      case PrizeStateType.Reward:
        if (!prizeState.taken) {
          this.boardGame.takePrizeAt(coord);
          return prizeState.prize;
        }
    }
    return undefined;
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
      const payout = jackpotPayout(this.jackpotsCollected) * payoutFactor;
      this.walletService.addToPayout(payout);
      this.jackpotsCollected++;
      return;
    }

    const payout = (prizePayouts.get(prize.toString()) ?? 0) * payoutFactor;
    if (Object.values(MoneyPrize).includes(prize as MoneyPrize)) {
      this.walletService.addToPayout(payout);
    } else if (Object.values(InventoryPrize).includes(prize as InventoryPrize)) {
      this.inventoryService.addBeams(Beam.Normal, payout);
    } else if (Object.values(Beam).includes(prize as Beam)) {
      this.inventoryService.addBeams(prize as Beam, payout);
    } else if (Object.values(Bomb).includes(prize as Bomb) && detonatesBomb(beam)) {
      this.bombExploded = true;
      this.walletService.setPayout(0);
    }
  }

  // TODO: Decide how to compute next level.
  private nextLevel(): number {
    if (this.walletService.getPayout() === 0) {
      return Math.max(this.game.level - 1, 1);
    }

    if (!this.bombExploded && this.wonAllJackpots()) {
      return Math.min(this.game.level + 1, 8);
    }

    return this.game.level;
  }
}
