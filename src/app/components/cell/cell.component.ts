import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { GameService } from 'src/app/services/game/game.service';
import { InputAdapterService } from 'src/app/services/input-adapter/input-adapter.service';
import { GbaInput, isAInput } from 'src/app/services/input-adapter/inputs';
import { Cell } from '../../common/cell';

enum SelectionCssClass {
  Default = 'default',
  Traversable = 'traversable',
  Selectable = 'selectable',
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
  @Output() selectedEvent = new EventEmitter<Cell>();

  inputObservable: Subscription;

  constructor(
    private gameService: GameService,
    private inputAdapterService: InputAdapterService) {
    this.inputObservable = this.inputAdapterService.inputSubject
      .pipe(filter((value) => isAInput(value)))
      .subscribe((input) => { this.handleAInput(input); });
  }

  ngOnInit(): void {
  }

  // If selectable, mark the cell as selected and pass an event to the parent
  // component.
  @HostListener("click") onClick(): void {
    this.trySelect();
  }

  getClasses(): string {
    const visibility = this.getVisible() ? 'visible' : 'invisible';
    const cellCategory = this.cell?.getCategory() ?? '';
    const selectionState = this.getSelectionCssClass() ?? '';
    return `${visibility} ${cellCategory} ${selectionState}`;
  }

  getText(): string {
    if (!this.cell) return '';

    return this.cell.getText(this.gameService.game.level);
  }

  private getVisible(): boolean {
    return this.cell?.visible ?? false;
  }

  private getSelectionCssClass(): string {
    if (!this.cell) return '';

    // Always show selection whether the cell is interactive or not.
    if (this.cell.selected) {
      return SelectionCssClass.Selected;
    }

    if (this.cell.traversable) {
      if (this.cell.focused) {
        return SelectionCssClass.Focused;
      }
      if (this.cell.selectable) {
        return SelectionCssClass.Selectable;
      }
      return SelectionCssClass.Traversable;
    }

    return '';
  }

  private trySelect(): void {
    if (!this.cell) return;

    // Don't emit an event if the cell is not in a selectable state.
    if (!this.cell.selectable) return;
    if (!this.cell.validSelection()) return;

    this.cell.selected = true;
    this.selectedEvent.emit(this.cell);
  }

  private handleAInput(input: GbaInput): void {
    if (!this.cell?.focused) return;

    this.trySelect();
  }
}
