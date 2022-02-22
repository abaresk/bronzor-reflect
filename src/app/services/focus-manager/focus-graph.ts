import { Direction } from "src/app/common/geometry/direction";
import { FocusHandle } from "./focus-handle";

export interface FocusConnection {
    fromHandle: FocusHandle;
    toHandle: FocusHandle;
    dir: Direction;
};

export interface FocusGraph {
    connections: FocusConnection[];
};
