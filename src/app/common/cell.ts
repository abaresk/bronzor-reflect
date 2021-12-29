export enum SelectionState {
    Unselected,
    Focused,
    Selected,
};

export class Cell {
    visible: boolean;
    interactable: boolean = false;
    selectionState: SelectionState = SelectionState.Unselected;

    constructor(visible: boolean = true) {
        this.visible = visible;
    }

    setVisibility(visible: boolean) {
        this.visible = visible;
    }

    getSelectable(): boolean { return false; }

    setInteractability(interactable: boolean) {
        // Only selectable cells can be made interactive.
        if (!this.getSelectable()) return;

        this.interactable = interactable;
    }

    setSelectionState(state: SelectionState) {
        // You can only set this on selectable cells.
        if (!this.getSelectable()) return;

        this.selectionState = state;
    }

    validSelection(): boolean { return false; }

    getText(level: number): string { return ''; }

    getCategory(): string { return ''; }
}
