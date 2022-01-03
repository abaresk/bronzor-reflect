import { Cell } from "src/app/common/cell";
import { Beam, getPrizeText } from "src/app/common/prizes";

export class InventoryCell extends Cell {
    static CATEGORY = 'inventory-cell';
    item: Beam;// The item this corresponds to
    count: number; // Current stock for item
    validateSelection?: (item: Beam) => boolean;

    constructor(item: Beam, count: number, validateSelection: (item: Beam) => boolean) {
        super();
        this.item = item;
        this.count = count;
        this.validateSelection = validateSelection;
    }

    override validSelection(): boolean {
        if (!this.validateSelection) return false;

        return this.validateSelection(this.item);
    }

    // Get text representation of the cell
    override getText(level: number): string {
        const itemName = getPrizeText(this.item, level);
        return `${itemName}: ${this.count}`;
    }

    override getCategory(): string {
        return InventoryCell.CATEGORY;
    }
}
