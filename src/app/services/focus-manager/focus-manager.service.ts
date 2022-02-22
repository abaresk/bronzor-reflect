import { Injectable } from '@angular/core';
import { filter } from 'rxjs';
import { Direction, oppositeDir } from 'src/app/common/geometry/direction';
import { InputAdapterService } from '../input-adapter/input-adapter.service';
import { isDpadInput } from '../input-adapter/inputs';
import { FocusGraph } from './focus-graph';
import { FocusHandle } from './focus-handle';

@Injectable({
  providedIn: 'root'
})
export class FocusManagerService {
  graph?: FocusGraph;
  focusedHandle?: FocusHandle;

  constructor(private inputAdapterService: InputAdapterService) {
    this.inputAdapterService.inputSubject
      .pipe(filter((value) => isDpadInput(value)))
      .subscribe((input) => { this.handleDpadInput(input); });
  }

  setGraph(graph: FocusGraph, initialHandle: FocusHandle): void {
    this.graph = graph;

    initialHandle.setFocus(initialHandle.currentCoord);
    this.focusedHandle = initialHandle;
  }

  move(dir: Direction): void {
    const nextFocus = this.focusedHandle.move(dir);
    if (nextFocus.overflow !== undefined) {
      const toHandle = this.getToHandle(this.focusedHandle, nextFocus.overflow);
      if (toHandle) {
        toHandle.enter(nextFocus.overflow);
      }
      this.focusedHandle.leave();
      return;
    }

    this.focusedHandle.setFocus(nextFocus.coord);
  }

  private getToHandle(fromHandle: FocusHandle, dir: Direction): FocusHandle | undefined {
    for (let connection of this.graph?.connections) {
      if (connection.fromHandle === fromHandle && connection.dir === dir) {
        return connection.toHandle;
      }
      if (connection.toHandle === fromHandle && connection.dir === oppositeDir(dir)) {
        return connection.fromHandle;
      }
    }
    return undefined;
  }
}
