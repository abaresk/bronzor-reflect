import { Component, HostListener } from '@angular/core';
import { ScreenComponent } from './components/screen/screen.component';
import { InputAdapterService } from './services/input-adapter/input-adapter.service';
import { ClientFileComponent } from './components/client-file/client-file.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ClientFileComponent, ScreenComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'bronzor-reflect';

  constructor(private inputAdapterService: InputAdapterService) { }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.inputAdapterService.pressKey(event);
  }
}
