import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../wallet.service';

@Component({
  selector: 'game-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  constructor(public walletService: WalletService) { }

  ngOnInit(): void {
  }
}
