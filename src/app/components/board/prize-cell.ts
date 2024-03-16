import { Cell } from '../../common/cell';
import { getPrizeText, PrizeState, PrizeStateType } from '../../common/prizes';

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

    switch (this.prizeState.type) {
      case PrizeStateType.Bomb:
        return this.prizeState.defused ? `Bomb\ndefused` : 'Bomb';
      case PrizeStateType.Reward:
        const prizeName = getPrizeText(this.prizeState.prize, jackpotsCollected);
        return this.prizeState.taken ? `${prizeName}\ntaken` : `${prizeName}`;
    }
  }

  override getCategory(): string {
    return PrizeCell.CATEGORY;
  }
}
