import { Bronzor } from "../../common/board";
import { Cell } from "../../common/cell";
import { MemoState, MEMO_DISLAYS, MEMO_STATES } from "../../common/memo";

export class BoardCell extends Cell {
  static CATEGORY = 'board-cell';
  bronzor: Bronzor | undefined;
  revealHidden: boolean = false;
  memoState: MemoState = MemoState.UNMARKED;

  constructor(bronzor: Bronzor | undefined) {
    super();
    this.bronzor = bronzor;
  }

  // Get text representation of the cell
  override getText(jackpotsCollected: number): string {
    if (this.bronzor) {
      if (this.bronzor.visible) return 'B';
      if (this.revealHidden) return 'H';
    }

    return MEMO_DISLAYS.get(this.memoState.toString()) ?? '';
  }

  override getCategory(): string {
    return BoardCell.CATEGORY;
  }

  setRevealHidden(value: boolean): void {
    this.revealHidden = value;
  }

  override validSelection(): boolean { return true; }

  select(): void {
    this.toggleMemoState();

    // Tiles with marked memo state appear selected. Visible Bronzors can't be
    // selected.
    this.selected = (this.memoState !== MemoState.UNMARKED) &&
        !(this.bronzor && this.bronzor.visible);
  }

  clearMemoState(): void {
    this.memoState = MemoState.UNMARKED;
  }

  private toggleMemoState(): void {
    const idx = MEMO_STATES.indexOf(this.memoState);
    const nextIdx = (idx + 1) % MEMO_STATES.length;
    this.memoState = MEMO_STATES[nextIdx];
  }
}
