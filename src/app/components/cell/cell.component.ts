import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { GameService } from '../../services/game/game.service';
import { InputAdapterService } from '../../services/input-adapter/input-adapter.service';
import { GbaInput, isAInput } from '../../services/input-adapter/inputs';
import { Cell } from '../../common/cell';
import { NgClass } from '@angular/common';

enum SelectionCssClass {
  Default = 'default',
  Traversable = 'traversable',
  Selectable = 'selectable',
  Focused = 'focused',
  Selected = 'selected',
};

@Component({
  selector: 'game-cell',
  standalone: true,
  imports: [NgClass],
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

  getText(): string {
    if (!this.cell) return '';

    return this.cell.getText(this.gameService.jackpotsCollected);
  }

  getVisible(): boolean {
    return this.cell?.visible ?? false;
  }

  getCategory(): string {
    return this.cell?.getCategory() ?? '';
  }

  getFocused(): boolean {
    return this.cell?.focused ?? false;
  }

  getSelected(): boolean {
    return this.cell?.selected ?? false;
  }

  getSelectable(): boolean {
    if (!this.cell) return false;

    return this.cell.traversable && this.cell.selectable;
  }

  getTraversable(): boolean {
    if (!this.cell) return false;

    return this.cell.traversable && !this.cell.selectable;
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
