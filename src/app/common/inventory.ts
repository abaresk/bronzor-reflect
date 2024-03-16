import { Beam } from "../parameters/beams";

export interface Inventory {
  beams: Map<Beam, number>;
}
