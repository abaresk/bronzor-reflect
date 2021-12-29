export enum GbaInput {
    Up,
    Right,
    Down,
    Left,
    A,
    B,
    Start,
    Select,
    L,
    R,
};

export function isDpadInput(input: GbaInput): boolean {
    switch (input) {
        case GbaInput.Up:
        case GbaInput.Right:
        case GbaInput.Down:
        case GbaInput.Left:
            return true;
    }
    return false;
}

export function isAInput(input: GbaInput): boolean {
    return input === GbaInput.A;
}

export function isBInput(input: GbaInput): boolean {
    return input === GbaInput.B;
}

export function keyboardInputToGbaInput(keyboardInput: string): GbaInput | undefined {
    switch (keyboardInput) {
        case 'KeyW':
        case 'ArrowUp':
            return GbaInput.Up;
        case 'KeyD':
        case 'ArrowRight':
            return GbaInput.Right;
        case 'KeyS':
        case 'ArrowDown':
            return GbaInput.Down;
        case 'KeyA':
        case 'ArrowLeft':
            return GbaInput.Left;
        case 'Space':
        case 'KeyX':
            return GbaInput.A;
        case 'KeyZ':
            return GbaInput.B;
        case 'Enter':
            return GbaInput.Start;
        case 'Backspace':
            return GbaInput.Select;
    }
    return undefined;
}
