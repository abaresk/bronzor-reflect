import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Beam } from '../../common/prizes';
import { Inventory } from '../../common/inventory';

export interface InventoryStock {
  beam: Beam;
  count: number;
};

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  inventory = {} as Inventory;
  selectionResolve?: (item: Beam) => void;
  inventorySubject: Subject<InventoryStock>;

  constructor() {
    this.inventorySubject = new Subject<InventoryStock>();
  }

  new(level: number) {
    // TODO: Provide an initial number of normal beams depending on the level.
    // Use addBeams() so it gets broadcasted to subscribers.
    this.inventory = { beams: new Map() };
    this.addBeams(Beam.Normal, 8);
  }

  // `delta` can be positive or negative
  addBeams(beam: Beam, delta: number) {
    const currentCount = this.inventory.beams.get(beam) ?? 0;
    const newCount = Math.max(currentCount + delta, 0);
    this.inventory.beams.set(beam, newCount);
    this.inventorySubject.next({ beam: beam, count: newCount });
  }

  anyBeams(): boolean {
    for (let [_, count] of this.inventory.beams) {
      if (count > 0) return true;
    }
    return false;
  }

  validSelection(item: Beam): boolean {
    const count = this.inventory.beams.get(item) ?? 0;
    return count > 0;
  }

  async waitForSelection(): Promise<Beam> {
    return new Promise((resolve) => {
      this.selectionResolve = resolve;
    });
  }

  selectItem(item: Beam): void {
    if (!this.selectionResolve) return;

    this.selectionResolve(item);
  }
}
