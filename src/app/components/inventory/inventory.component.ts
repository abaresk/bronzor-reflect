import { Component, HostListener, OnInit } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { Cell, SelectionState } from 'src/app/common/cell';
import { Beam, InventoryPrize } from 'src/app/common/prizes';
import { InventoryService, InventoryStock } from 'src/app/services/inventory/inventory.service';
import { SelectionFocus } from 'src/app/common/selection-focus';
import { InventoryCell } from './inventory-cell';
import { InputAdapterService } from 'src/app/services/input-adapter/input-adapter.service';
import { GbaInput, isDpadInput } from 'src/app/services/input-adapter/inputs';

const INVENTORY_ORDER: ReadonlyArray<ReadonlyArray<Beam>> = [
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
  inputObservable: Subscription;
  cells: Map<Beam, InventoryCell>;
  // True if focus is inside the Inventory menu.
  focused: boolean = false;

  constructor(
    public inventoryService: InventoryService,
    public inputAdapterService: InputAdapterService) {
    this.cells = this.initializeCells();
    this.inventoryObservable = inventoryService.inventorySubject
      .subscribe((stock) => { this.setInventoryCount(stock); });
    this.inventorySelectionFocusObservable =
      inventoryService.inventorySelectionFocusSubject.subscribe(
        (focus) => { this.setSelectionFocus(focus) });
    this.inputObservable = this.inputAdapterService.inputSubject
      .pipe(filter((value) => isDpadInput(value)))
      .subscribe((input) => { this.handleInput(input); });
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
  private focus(): void {
    this.focused = true;

    // Make each item interactable.
    for (let item of this.inventoryOrder.flat()) {
      const cell = this.cells.get(item);
      cell?.setInteractability(true);
    }

    // TODO: Automatically focus on the first cell in the inventory.

  }

  private unfocus(): void {
    this.focused = false;

    for (let item of this.inventoryOrder.flat()) {
      const cell = this.cells.get(item);
      cell?.setInteractability(false);
    }
  }

  // Make items un-interactable and clear any selection state.
  private clearSelection() {
    this.focused = false;

    for (let item of this.inventoryOrder.flat()) {
      const cell = this.cells.get(item);
      cell?.setInteractability(true);
      cell?.setSelectionState(SelectionState.Unselected);
      cell?.setInteractability(false);
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

  private handleInput(input: GbaInput): void {
    if (!this.focused) return;

    // TODO: Modify cell that currently has focus
  }
}
