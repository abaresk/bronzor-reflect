import { Injectable } from '@angular/core';
import { TICK } from '../../common/tick';
import { Wallet } from '../../wallet';

// Number of coins merged per tick.
const DEFAULT_COINS_PER_TICK = 1;

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  wallet = {} as Wallet;
  coinsPerTick: number = DEFAULT_COINS_PER_TICK;

  constructor() { }

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

  setFastMergeSpeed() {
    this.coinsPerTick = DEFAULT_COINS_PER_TICK * 2;
  }

  setRegularMergeSpeed() {
    this.coinsPerTick = DEFAULT_COINS_PER_TICK;
  }

  // Incrementally add payout to credit. Resolves when the merge is finished.
  async mergeFunds() {
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (this.wallet.payout <= 0) {
          clearInterval(intervalId);
          resolve(undefined);
        } else {
          const transfer = Math.min(this.wallet.payout, this.coinsPerTick);
          this.wallet.payout -= transfer;
          this.wallet.credit += transfer;
        }
      }, TICK);
    });
  }
}
