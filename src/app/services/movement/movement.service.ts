import { Injectable } from '@angular/core';
import { filter, Subject, Subscription } from 'rxjs';
import { BOARD_LENGTH } from 'src/app/common/config';
import { Coord } from 'src/app/common/geometry/coord';
import { Direction, isHorizontal, oppositeDir } from 'src/app/common/geometry/direction';
import { INVENTORY_ORDER } from 'src/app/components/inventory/inventory.component';
import { modulo } from 'src/app/util/modulo';
import { GameService, GameState } from '../game/game.service';
import { InputAdapterService } from '../input-adapter/input-adapter.service';
import { coerceDirection, GbaInput, isDpadInput, toDirection } from '../input-adapter/inputs';

export enum GameComponent {
  BoardComponent,
  InventoryComponent,
}

export interface Focus {
  component: GameComponent;
  coord: Coord;
}

interface ShiftedCoord {
  // The new coordinate
  coord: Coord;
  // The direction the coordinate was moving when it overflowed
  overflow?: Direction;
}

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  currentComponent: GameComponent;
  inputObservable: Subscription;
  focusSubject: Subject<Focus>;

  private focusMap: Map<string, Coord>;

  constructor(
    private gameService: GameService,
    private inputAdapterService: InputAdapterService
  ) {
    this.currentComponent = GameComponent.InventoryComponent;
    this.focusMap = new Map([
      [GameComponent.InventoryComponent.toString(), new Coord(0, 0)],
      [GameComponent.BoardComponent.toString(), new Coord(0, 0)],
    ]);

    this.inputObservable = this.inputAdapterService.inputSubject
      .pipe(filter((value) => isDpadInput(value)))
      .subscribe((input) => { this.handleDpadInput(input); });
    this.focusSubject = new Subject<Focus>();
  }

  private handleDpadInput(input: GbaInput): void {
    const dir = coerceDirection(input);

    switch (this.currentComponent) {
      case GameComponent.BoardComponent:
        this.handleBoardMovement(dir);
        break;
      case GameComponent.InventoryComponent:
        this.handleInventoryMovement(dir);
        break;
    }

    const currentCoord = this.focusMap.get(this.currentComponent.toString())
    if (!currentCoord) return;

    this.focusSubject.next({ component: this.currentComponent, coord: currentCoord });
  }

  private handleBoardMovement(dir: Direction): void {
    const currentCoord =
      this.focusMap.get(GameComponent.BoardComponent.toString());
    if (!currentCoord) return;

    const shiftedCoord = this.shiftBoardCoord(currentCoord, dir);

    if (this.gameService.gameState === GameState.SelectItem) {
      if (shiftedCoord.overflow && isHorizontal(shiftedCoord.overflow)) {
        this.shiftIntoComponent(GameComponent.InventoryComponent, shiftedCoord.overflow);
        return;
      }
    }

    this.focusMap.set(GameComponent.BoardComponent.toString(), shiftedCoord.coord);
  }

  private handleInventoryMovement(dir: Direction): void {
    const currentCoord =
      this.focusMap.get(GameComponent.InventoryComponent.toString());
    if (!currentCoord) return;

    const newCoord = currentCoord.coordAt(dir, 1);
    if (newCoord.col < 0 || newCoord.col >= INVENTORY_ORDER[0].length) {
      const fromDir = (newCoord.col < 0) ? Direction.Left : Direction.Right;
      this.shiftIntoComponent(GameComponent.BoardComponent, fromDir);
      return;
    }

    // Wrap vertically
    newCoord.row = modulo(newCoord.row, INVENTORY_ORDER.length);
    this.focusMap.set(GameComponent.InventoryComponent.toString(), newCoord);
  }

  private shiftBoardCoord(currentCoord: Coord, dir: Direction): ShiftedCoord {
    let overflow = undefined;
    const newCoord = currentCoord.coordAt(dir, 1);

    // If moved into a corner, snap onto the adjacent edge segment.
    if (currentCoord.col === -1 || currentCoord.col === BOARD_LENGTH) {
      if (newCoord.row === -1 || newCoord.row === BOARD_LENGTH) {
        newCoord.col = (newCoord.col === -1) ? 0 : BOARD_LENGTH - 1;
      }
    } else if (currentCoord.row === -1 || currentCoord.row === BOARD_LENGTH) {
      if (newCoord.col === -1 || newCoord.col === BOARD_LENGTH) {
        newCoord.row = (newCoord.row === -1) ? 0 : BOARD_LENGTH - 1;
      }
    }

    // Wrap around edges
    if (newCoord.row === -2 || newCoord.row == BOARD_LENGTH + 1) {
      newCoord.row = (newCoord.row === -2) ? BOARD_LENGTH : -1;
      overflow = dir;
    } else if (newCoord.col === -2 || newCoord.col == BOARD_LENGTH + 1) {
      newCoord.col = (newCoord.col === -2) ? BOARD_LENGTH : -1;
      overflow = dir;
    }

    return { coord: newCoord, overflow: overflow };
  }

  private shiftIntoComponent(component: GameComponent, dir: Direction): void {
    let coord = new Coord(0, 0);
    switch (component) {
      case GameComponent.BoardComponent:
        coord = this.shiftIntoBoard(dir);
        break;
      case GameComponent.InventoryComponent:
        coord = this.shiftIntoInventory(dir);
        break;
    }

    this.currentComponent = component;
    this.focusMap.set(component.toString(), coord);
  }

  private shiftIntoBoard(dir: Direction): Coord {
    // Previously focused coordinate
    const coord =
      this.focusMap.get(GameComponent.BoardComponent.toString()) ??
      new Coord(0, 0);

    const newPos = (dir === Direction.Up || dir === Direction.Left) ?
      BOARD_LENGTH : -1;
    if (isHorizontal(dir)) {
      coord.col = newPos;
    } else {
      coord.row = newPos;
    }
    return coord;
  }

  private shiftIntoInventory(dir: Direction): Coord {
    // Previously focused coordinate
    const coord =
      this.focusMap.get(GameComponent.InventoryComponent.toString()) ??
      new Coord(0, 0);

    if (isHorizontal(dir)) {
      coord.col = (dir === Direction.Left) ? INVENTORY_ORDER[0].length - 1 : 0;
    } else {
      coord.row = (dir === Direction.Up) ? INVENTORY_ORDER.length - 1 : 0;
    }
    return coord;
  }
}
