import { Component, HostListener, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Cell, InventoryCell, SelectionState } from 'src/app/components/cell/cell';
import { Beam, InventoryPrize } from 'src/app/common/prizes';
import { InventoryService, InventoryStock } from 'src/app/services/inventory/inventory.service';

const inventoryOrder: ReadonlyArray<Beam> = [
  Beam.Normal,
  Beam.Water,
  Beam.DoublePrize,
  Beam.Flame,
  Beam.Comet,
  Beam.Phase,
];

@Component({
  selector: 'game-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  inventoryOrder: ReadonlyArray<Beam> = inventoryOrder;
  inventoryObservable: Subscription;
  cells: Map<Beam, InventoryCell>;

  constructor(public inventoryService: InventoryService) {
    this.cells = this.initializeCells();
    this.inventoryObservable = inventoryService.inventorySubject
      .subscribe((stock) => { this.setInventoryCount(stock); });
  }

  ngOnInit(): void {
  }

  getCell(item: Beam): InventoryCell {
    return this.cells.get(item) ?? new InventoryCell(item);
  }

  selectItem(cell: Cell): Beam | undefined {
    if (cell instanceof InventoryCell) {
      this.inventoryService.selectItem(cell.item);
    }
    return undefined;
  }

  // Move focus into the inventory component.
  focus(): void {
    // Make each item interactable.
    for (let item of inventoryOrder) {
      const cell = this.cells.get(item);
      cell?.setInteractability(true);
    }

    // TODO: Automatically focus on the first cell in the inventory.

  }

  unfocus(): void {
    for (let item of inventoryOrder) {
      const cell = this.cells.get(item);
      cell?.setInteractability(false);
    }
  }

  // Make items un-interactable and clear any selection state.
  clearSelection() {
    for (let item of inventoryOrder) {
      const cell = this.cells.get(item);
      cell?.setInteractability(true);
      cell?.setSelectionState(SelectionState.Unselected);
      cell?.setInteractability(false);
    }
  }

  private initializeCells(): Map<Beam, InventoryCell> {
    const cells = new Map();
    for (let item of inventoryOrder) {
      cells.set(item, new InventoryCell(item, 0));
    }
    return cells;
  }

  private setInventoryCount(stock: InventoryStock): void {
    const cell = this.cells.get(stock.beam);
    if (!cell) return;

    cell.count = stock.count;
    this.cells.set(stock.beam, cell);
  }
}
