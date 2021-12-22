import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { InventoryCell } from 'src/app/components/cell/cell';
import { Beam } from 'src/app/common/prizes';
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
  cells: Map<Beam, InventoryCell> = new Map();

  constructor(public inventoryService: InventoryService) {
    this.inventoryObservable = inventoryService.inventorySubject
      .subscribe((stock) => { this.setInventoryCount(stock); });
  }

  ngOnInit(): void {
  }

  getCell(item: Beam): InventoryCell {
    return this.cells.get(item) ?? new InventoryCell(item);
  }

  private setInventoryCount(stock: InventoryStock): void {
    const cell = new InventoryCell(stock.beam, stock.count);
    this.cells.set(stock.beam, cell);
  }
}
