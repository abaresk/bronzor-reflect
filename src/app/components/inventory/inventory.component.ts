import { Component, HostListener, OnInit } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { Cell } from 'src/app/common/cell';
import { Beam, InventoryPrize } from 'src/app/common/prizes';
import { InventoryService, InventoryStock } from 'src/app/services/inventory/inventory.service';
import { SelectionFocus } from 'src/app/common/selection-focus';
import { InventoryCell } from './inventory-cell';
import { InputAdapterService } from 'src/app/services/input-adapter/input-adapter.service';
import { GbaInput, isAInput, isDpadInput } from 'src/app/services/input-adapter/inputs';
import { Coord } from 'src/app/common/geometry/coord';
import { modulo } from 'src/app/util/modulo';
import { Focus, GameComponent, MovementService } from 'src/app/services/movement/movement.service';

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
  // True if focus is inside the Inventory menu.
  focused: boolean = false;
  // The item in inventory that has currently has focus.
  focusedItemCoord: Coord = new Coord(0, 0);

  constructor(
    public inventoryService: InventoryService,
    public movementService: MovementService) {
    this.cells = this.initializeCells();
    this.inventoryObservable = inventoryService.inventorySubject
      .subscribe((stock) => { this.setInventoryCount(stock); });
    this.inventorySelectionFocusObservable =
      inventoryService.inventorySelectionFocusSubject.subscribe(
        (focus) => { this.setSelectionFocus(focus) });
    this.focusObservable = this.movementService.focusSubject
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

  setSelectionFocus(selectionFocus: SelectionFocus): void {
    switch (selectionFocus) {
      case SelectionFocus.Focus:
        this.focus();
        break;
      case SelectionFocus.Unfocus:
        this.unfocus();
        break;
      case SelectionFocus.ClearSelection:
        this.clearSelection();
        break;
    }
  }

  // Move focus into the inventory component.
  private focus(coord?: Coord): void {
    this.focused = true;
    coord = coord ?? this.focusedItemCoord;
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
    this.focused = false;

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
    this.focused = false;

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
