import { Component, Input, OnInit } from '@angular/core';
import { BoardCell, Cell, IOCell, PrizeCell } from '../../cell';

enum Background {
  White = "white-background",
  LightGray = "light-gray-background",
  DarkGray = "dark-gray-background",
};

@Component({
  selector: 'game-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {
  @Input() cell: Cell | undefined;
  text: string = 's';

  background!: Background;

  constructor() { }

  ngOnInit(): void {
  }

  getClasses(): string {
    const visibility = this.getVisible() ? 'display-on' : 'display-off';
    const background = this.getBackground();
    return `${visibility} ${background}`;
  }

  getText(): string {
    if (!this.cell) return '';

    return this.cell.getText();
  }

  private getVisible(): boolean {
    return this.cell?.visible ?? false;
  }

  private getBackground(): Background {
    if (!this.cell) return Background.White;

    if (this.cell instanceof BoardCell) {
      return Background.White;
    } else if (this.cell instanceof PrizeCell) {
      return Background.DarkGray;
    } else if (this.cell instanceof IOCell) {
      return Background.LightGray;
    }

    return Background.White;
  }
}
