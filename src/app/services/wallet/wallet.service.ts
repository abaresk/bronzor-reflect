import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { TICK } from '../../common/tick';
import { Wallet } from '../../common/wallet';
import { InputAdapterService } from '../input-adapter/input-adapter.service';
import { GbaInput } from '../input-adapter/inputs';

// Number of coins merged per tick.
const DEFAULT_COINS_PER_TICK = 1;

enum MergeSpeed {
  Normal,
  Fast,
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  wallet = {} as Wallet;
  mergeSpeed = MergeSpeed.Normal;

  inputObservable: Subscription;

  constructor(
    private inputAdapterService: InputAdapterService
  ) {
    this.inputObservable = this.inputAdapterService.inputSubject
      .subscribe((input) => { this.handleInput(input); });
  }

  new(credit: number) {
    this.wallet.credit = credit;
    this.wallet.payout = 0;
  }

  getPayout() {
    return this.wallet.payout;
  }

  addToPayout(delta: number) {
    this.wallet.payout += delta;
  }

  setPayout(payout: number) {
    this.wallet.payout = payout;
  }

  coinsPerTick() {
    return (this.mergeSpeed === MergeSpeed.Fast) ?
      2 * DEFAULT_COINS_PER_TICK : DEFAULT_COINS_PER_TICK;
  }

  // Incrementally add payout to credit. Resolves when the merge is finished.
  async mergeFunds() {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (this.wallet.payout <= 0) {
          clearInterval(intervalId);
          resolve(undefined);
        } else {
          const transfer = Math.min(this.wallet.payout, this.coinsPerTick());
          this.wallet.payout -= transfer;
          this.wallet.credit += transfer;
        }
      }, TICK);
    });
  }

  private handleInput(input: GbaInput) {
    // Skip the coin merge
    if (input === GbaInput.Start) {
      this.wallet.credit += this.wallet.payout;
      this.wallet.payout = 0;
    }
  }
}
