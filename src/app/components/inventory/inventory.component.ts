import { Component, HostListener, OnInit } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { Cell } from 'src/app/common/cell';
import { Beam, InventoryPrize } from 'src/app/common/prizes';
import { InventoryService } from 'src/app/services/inventory/inventory.service';
import { InventoryCell } from './inventory-cell';
import { Coord } from 'src/app/common/geometry/coord';
import { Focus, GameComponent, FocusService } from 'src/app/services/focus/focus.service';
import { GameService, GameState } from 'src/app/services/game/game.service';
import { Inventory } from 'src/app/common/inventory';

export const INVENTORY_ORDER: ReadonlyArray<ReadonlyArray<Beam>> = [
  [Beam.Normal, Beam.Water, Beam.DoublePrize],
  [Beam.Comet, Beam.Shadow, Beam.Psybeam],
];

@Component({
  selector: 'game-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  inventoryOrder: ReadonlyArray<ReadonlyArray<Beam>> = INVENTORY_ORDER;
  inventoryObservable: Subscription;
  focusObservable: Subscription;
  gameStateObservable: Subscription;
  cells: Map<Beam, InventoryCell>;

  // The coord of the cell with focus or undefined if inventory doesn't have
  // focus.
  focusedItemCoord?: Coord;

  constructor(
    private gameService: GameService,
    public inventoryService: InventoryService,
    public focusService: FocusService) {
    this.cells = this.initializeCells();
    this.inventoryObservable = inventoryService.inventorySubject
      .subscribe((inventory) => { this.setInventoryCounts(inventory); });
    this.focusObservable = this.focusService.focusSubject
      .subscribe((focus) => { this.handleFocus(focus) });
    this.gameStateObservable = this.gameService.gameStateSubject
      .subscribe((state) => { this.handleGameState(state); })
  }

  ngOnInit(): void {
  }

  getCell(item: Beam): InventoryCell | undefined {
    return this.cells.get(item);
  }

  selectItem(cell: Cell): Beam | undefined {
    if (cell instanceof InventoryCell) {
      this.inventoryService.selectItem(cell.item);
    }
    return undefined;
  }

  private handleFocus(focus: Focus): void {
    if (focus.component !== GameComponent.InventoryComponent) {
      this.updateFocusedItem(undefined);
      return;
    }

    this.updateFocusedItem(focus.coord);
  }

  private handleGameState(state: GameState): void {
    switch (state) {
      case GameState.SelectItem:
        this.displaySelectItem();
        break;
      case GameState.SelectFiringPlace:
        this.displaySelectFiringPlace();
        break;
      case GameState.FireBeam:
        this.clearSelection();
        break;
    }
  }

  private displaySelectItem(): void {
    // Make each item interactable.
    for (let item of this.inventoryOrder.flat()) {
      const cell = this.cells.get(item);
      if (!cell) continue;

      cell.traversable = true;
      cell.selectable = true;
    }
  }

  private displaySelectFiringPlace(): void {
    // Make each item un-interactable, but don't clear selection.
    for (let item of this.inventoryOrder.flat()) {
      const cell = this.cells.get(item);
      if (!cell) continue;

      cell.traversable = false;
      cell.selectable = false;
    }
  }

  private clearSelection() {
    // Make items un-interactable and clear any selection state.
    for (let item of this.inventoryOrder.flat()) {
      const cell = this.cells.get(item);
      if (!cell) continue;

      cell.traversable = false;
      cell.selectable = false;
      cell.selected = false;
    }
  }

  private initializeCells(): Map<Beam, InventoryCell> {
    const cells = new Map();
    for (let item of this.inventoryOrder.flat()) {
      cells.set(item, new InventoryCell(item, 0,
        (checkItem: Beam) => { return this.inventoryService.validSelection(checkItem); }));
    }
    return cells;
  }

  private setInventoryCounts(inventory: Inventory): void {
    for (let [item, count] of inventory.beams) {
      const cell = this.cells.get(item);
      if (!cell) continue;

      cell.count = count;
      this.cells.set(item, cell);
    }
  }

  private updateFocusedItem(newItemCoord?: Coord) {
    // Remove focus from current item.
    if (this.focusedItemCoord) {
      const currentCell = this.getCellAtCoord(this.focusedItemCoord);
      if (currentCell) currentCell.focused = false;
    }

    if (newItemCoord) {
      const newCell = this.getCellAtCoord(newItemCoord);
      if (newCell) {
        newCell.focused = true;
      }
    }

    this.focusedItemCoord = newItemCoord;
  }

  private getCellAtCoord(coord: Coord): InventoryCell | undefined {
    const inventoryHeight = this.inventoryOrder.length;
    const inventoryWidth = this.inventoryOrder[0].length;
    if (coord.row < 0 || coord.row >= inventoryHeight) return undefined;
    if (coord.col < 0 || coord.col >= inventoryWidth) return undefined;

    return this.cells.get(this.inventoryOrder[coord.row][coord.col]);
  }
}
