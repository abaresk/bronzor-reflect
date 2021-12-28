import { Component, HostListener } from '@angular/core';
import { InputAdapterService } from './services/input-adapter/input-adapter.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bronzor-reflect';

  constructor(private inputAdapterService: InputAdapterService) { }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.inputAdapterService.pressKey(event);
  }
}
