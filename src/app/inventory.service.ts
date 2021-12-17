import { Injectable } from '@angular/core';
import { Beam } from './items';
import { Inventory } from './inventory';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  inventory = {} as Inventory;

  constructor() { }

  new() {
    this.inventory = { beams: new Map() };
  }

  // `delta` can be positive or negative
  addBeams(beam: Beam, delta: number) {
    const currentCount = this.inventory.beams.get(beam) ?? 0;
    const newCount = Math.max(currentCount + delta, 0);
    this.inventory.beams.set(beam, newCount);
  }
}
