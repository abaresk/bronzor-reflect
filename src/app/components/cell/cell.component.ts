import { Component, Input, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game/game.service';
import { Cell, SelectionState } from '../../cell';

enum SelectionCssClass {
  Uninteractable = 'uninteractable',
  Interactable = 'interactable',
  Focused = 'focused',
  Selected = 'selected',
};

@Component({
  selector: 'game-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {
  @Input() cell: Cell | undefined;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

  getClasses(): string {
    const visibility = this.getVisible() ? 'display-on' : 'display-off';
    const cellCategory = this.cell?.getCategory() ?? '';
    const selectable = this.getSelectable() ? 'selectable' : '';
    const selectionState = this.getSelectionCssClass() ?? '';
    return `${visibility} ${cellCategory} ${selectable} ${selectionState}`;
  }

  getText(): string {
    if (!this.cell) return '';

    return this.cell.getText(this.gameService.game.level);
  }

  private getVisible(): boolean {
    return this.cell?.visible ?? false;
  }

  private getSelectable(): boolean {
    return this.cell?.getSelectable() ?? false;
  }

  private getInteractable(): boolean {
    return this.cell?.interactable ?? false;
  }

  private getSelectionCssClass(): string {
    if (!this.getSelectable()) return '';

    if (!this.getInteractable()) return SelectionCssClass.Uninteractable;

    switch (this.cell?.selectionState) {
      case SelectionState.Unselected:
        return SelectionCssClass.Interactable;
      case SelectionState.Focused:
        return SelectionCssClass.Focused;
      case SelectionState.Selected:
        return SelectionCssClass.Selected;
    }

    return '';
  }
}
