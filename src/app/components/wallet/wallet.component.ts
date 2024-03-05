import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet/wallet.service';

@Component({
  selector: 'game-wallet',
  standalone: true,
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  constructor(public walletService: WalletService) { }

  ngOnInit(): void {
  }
}
