import { BOARD_LENGTH } from "src/app/common/config";
import { Coord } from "src/app/common/geometry/coord";
import { Direction } from "src/app/common/geometry/direction";
import { MemoFocusHandle } from "src/app/components/board/memo-focus-handle";
import { PlaceItemFocusHandle } from "src/app/components/board/placeitem-focus-handle";
import { InventoryFocusHandle } from "src/app/components/inventory/inventory-focus-handle";
import { INVENTORY_ORDER } from "src/app/components/inventory/inventory.component";
import { FocusGraph } from "./focus-graph";

const INVENTORY_FOCUS_HANDLE = new InventoryFocusHandle(
    new Coord(0, 0), INVENTORY_ORDER[0].length, INVENTORY_ORDER.length);
const MEMO_FOCUS_HANDLE = new MemoFocusHandle(new Coord(0, 0), BOARD_LENGTH);
const PLACEITEM_FOCUS_HANDLE =
    new PlaceItemFocusHandle(new Coord(-1, 0), BOARD_LENGTH);

const SELECT_ITEM_GRAPH: FocusGraph = {
    connections: [{
        fromHandle: MEMO_FOCUS_HANDLE,
        toHandle: INVENTORY_FOCUS_HANDLE,
        dir: Direction.Right,
    }],
};
const PLACEITEM_GRAPH: FocusGraph = {
    connections: [{
        fromHandle: PLACEITEM_FOCUS_HANDLE,
        toHandle: INVENTORY_FOCUS_HANDLE,
        dir: Direction.Right,
    }],
};
