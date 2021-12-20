import { Beam } from './items';

export interface Inventory {
    beams: Map<Beam, number>;
}
