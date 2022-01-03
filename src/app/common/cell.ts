export class Cell {
    visible: boolean;
    traversable: boolean = false;
    selectable: boolean = false;
    focused: boolean = false;
    selected: boolean = false;

    constructor(visible: boolean = true) {
        this.visible = visible;
    }

    validSelection(): boolean { return false; }

    getText(level: number): string { return ''; }

    getCategory(): string { return ''; }
}
