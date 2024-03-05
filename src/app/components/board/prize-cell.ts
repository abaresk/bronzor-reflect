import { Cell } from '../../common/cell';
import { getPrizeText, PrizeState } from '../../common/prizes';

export class PrizeCell extends Cell {
  static CATEGORY = 'prize-cell';
  // PrizeState or `undefined` if the cell doesn't have a prize.
  prizeState: PrizeState | undefined;

  constructor(prizeState: PrizeState | undefined) {
    super();
    this.prizeState = prizeState;
  }

  // Get text representation of the cell
  override getText(jackpotsCollected: number): string {
    if (!this.prizeState) return '';

    const taken = this.prizeState.taken ? 'taken' : '';
    const prizeName = getPrizeText(this.prizeState.prize, jackpotsCollected);
    return taken ? `${prizeName}\n${taken}` : `${prizeName}`;
  }

  override getCategory(): string {
    return PrizeCell.CATEGORY;
  }
}
