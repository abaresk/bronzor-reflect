import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { CellComponent } from './components/cell/cell.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { LevelComponent } from './components/level/level.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { ScreenComponent } from './components/screen/screen.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent,
    WalletComponent,
    LevelComponent,
    InventoryComponent,
    ScreenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
