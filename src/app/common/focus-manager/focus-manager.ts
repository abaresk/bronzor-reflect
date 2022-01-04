import { Direction, oppositeDir } from 'src/app/common/geometry/direction';
import { FocusHandle } from './focus-handle';

export interface FocusConnection {
  fromHandle: FocusHandle;
  toHandle: FocusHandle;
  dir: Direction;
};

export interface FocusGraph {
  connections: FocusConnection[];
};

export class FocusManager {
  graph: FocusGraph;
  focusedHandle: FocusHandle

  constructor(graph: FocusGraph, initialHandle: FocusHandle) {
    this.graph = graph;
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
    for (let connection of this.graph.connections) {
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
