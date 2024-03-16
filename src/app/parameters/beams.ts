import { CustomSet } from "../util/custom-set";

export enum Beam {
    Normal = 'Beam.Normal',
    Comet = 'Beam.Comet',
    Flame = 'Beam.Flame',
    FlashCannon = 'Beam.FlashCannon',
    Shadow = 'Beam.Shadow',
    Psybeam = 'Beam.Pysbeam',
    DoublePrize = 'Beam.DoublePrize',
    Water = 'Beam.Water',
}

export const normalBeam = Beam.Normal;
export const cometBeam = Beam.Comet;
export const flameBeam = Beam.Flame;
export const flashCannonBeam = Beam.FlashCannon;
export const shadowBeam = Beam.Shadow;
export const psyBeam = Beam.Psybeam;
export const doublePrizeBeam = Beam.DoublePrize;
export const waterBeam = Beam.Water;

export const beams: ReadonlyArray<Beam> = [
    normalBeam,
    cometBeam,
    flameBeam,
    flashCannonBeam,
    shadowBeam,
    psyBeam,
    doublePrizeBeam,
    waterBeam,
];

// -----------------------------------------------------------------------------
// Interactions
//
// These are the initial settings for each type of beam. Some of these settings
// may change as the beam traverses the board and interacts with Bronzors.
// -----------------------------------------------------------------------------

// Beams that are affected by Bronzor deflection.
export const deflectBeams: ReadonlySet<Beam> = new Set([
    normalBeam,
    cometBeam,
    flameBeam,
    shadowBeam,
    doublePrizeBeam,
    waterBeam,
]);

// Beams that can collide into Bronzor (which will end the path).
//
// NOTE: Flame beam is a special case, as it will collides only after it has
// destroyed a Bronzor.
export const collideBeams: ReadonlySet<Beam> = new Set([
    normalBeam,
    cometBeam,
    flashCannonBeam,
    doublePrizeBeam,
    waterBeam,
]);

// Beams that will destroy a Bronzor on collision.
//
// NOTE: The Flame beam will only destroy the first Bronzor it collides with.
export const destroyBronzorBeams: ReadonlySet<Beam> = new Set([
    flameBeam,
]);

// Only water beams will not detonate a bomb.
export const bombDetonators: ReadonlySet<Beam> = new CustomSet(beams)
    .difference(new Set([waterBeam]));

// Water beams can defuse bombs.
export const bombDefusers: ReadonlySet<Beam> = new Set([
    waterBeam,
]);

// The range at which a beam will trigger a bomb.
export function bombEffectRange(beam: Beam): number {
    switch (beam) {
        case Beam.Flame:
        case Beam.Water:
            // Triggers on adjacent cells.
            return 1;
        default:
            // Must hit dead-on.
            return 0;
    }
}
