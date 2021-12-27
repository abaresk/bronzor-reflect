export enum Direction {
    Up,
    Right,
    Down,
    Left,
}

export const directions = [
    Direction.Up,
    Direction.Right,
    Direction.Down,
    Direction.Left
] as const;

export function rotateClockwise(dir: Direction, turns: number): Direction {
    const idx = directions.indexOf(dir);
    return directions[(idx + turns) % 4]
}

export function oppositeDir(dir: Direction): Direction {
    return rotateClockwise(dir, 2);
}
