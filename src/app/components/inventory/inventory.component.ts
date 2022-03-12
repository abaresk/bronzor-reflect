import { Component, HostListener, OnInit } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { Cell } from 'src/app/common/cell';
import { Beam, InventoryPrize } from 'src/app/common/prizes';
import { InventoryService, InventoryStock } from 'src/app/services/inventory/inventory.service';
import { InventoryCell } from './inventory-cell';
import { Coord } from 'src/app/common/geometry/coord';
import { Focus, GameComponent, FocusService } from 'src/app/services/focus/focus.service';

export const INVENTORY_ORDER: ReadonlyArray<ReadonlyArray<Beam>> = [
  [Beam.Normal, Beam.Water, Beam.DoublePrize],
  [Beam.Flame, Beam.Comet, Beam.Phase],
];

@Component({
  selector: 'game-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  inventoryOrder: ReadonlyArray<ReadonlyArray<Beam>> = INVENTORY_ORDER;
  inventoryObservable: Subscription;
  inventorySelectionFocusObservable: Subscription;
  focusObservable: Subscription;
  cells: Map<Beam, InventoryCell>;

  // The coord of the cell with focus or undefined if inventory doesn't have
  // focus.
  focusedItemCoord?: Coord;

  constructor(
    public inventoryService: InventoryService,
    public focusService: FocusService) {
    this.cells = this.initializeCells();
    this.inventoryObservable = inventoryService.inventorySubject
      .subscribe((stock) => { this.setInventoryCount(stock); });
    this.inventorySelectionFocusObservable =
      inventoryService.inventorySelectionClearSubject.subscribe(
        () => { this.clearSelection() });
    this.focusObservable = this.focusService.focusSubject
      .subscribe((focus) => { this.handleFocus(focus) });
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

  // Move focus into the inventory component.
  private focus(coord: Coord): void {
    this.updateFocusedItem(coord);

    // Make each item interactable.
    for (let item of this.inventoryOrder.flat()) {
      const cell = this.cells.get(item);
      if (!cell) continue;

      cell.traversable = true;
      cell.selectable = true;
    }
  }

  private unfocus(): void {
    this.focusedItemCoord = undefined;

    for (let item of this.inventoryOrder.flat()) {
      const cell = this.cells.get(item);
      if (!cell) continue;

      cell.traversable = false;
      cell.selectable = false;
    }
  }

  private handleFocus(focus: Focus): void {
    if (focus.component !== GameComponent.InventoryComponent) {
      this.unfocus();
      return;
    }

    this.focus(focus.coord);
  }

  // Make items un-interactable and clear any selection state.
  private clearSelection() {
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

  private setInventoryCount(stock: InventoryStock): void {
    const cell = this.cells.get(stock.beam);
    if (!cell) return;

    cell.count = stock.count;
    this.cells.set(stock.beam, cell);
  }

  private updateFocusedItem(newItemCoord: Coord) {
    // Remove focus from current item.
    if (this.focusedItemCoord) {
      const currentCell = this.getCellAtCoord(this.focusedItemCoord);
      if (currentCell) currentCell.focused = false;
    }

    const newCell = this.getCellAtCoord(newItemCoord);
    if (newCell) {
      newCell.focused = true;
      this.focusedItemCoord = newItemCoord;
    }
  }

  private getCellAtCoord(coord: Coord): InventoryCell | undefined {
    const inventoryHeight = this.inventoryOrder.length;
    const inventoryWidth = this.inventoryOrder[0].length;
    if (coord.row < 0 || coord.row >= inventoryHeight) return undefined;
    if (coord.col < 0 || coord.col >= inventoryWidth) return undefined;

    return this.cells.get(this.inventoryOrder[coord.row][coord.col]);
  }
}
