import { Direction } from "../../common/geometry/direction";

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

export function isVertical(input: GbaInput): boolean {
  return input === GbaInput.Up || input === GbaInput.Down;
}

export function isHorizontal(input: GbaInput): boolean {
  return input === GbaInput.Left || input === GbaInput.Right;
}

export function toDirection(input: GbaInput): Direction | undefined {
  switch (input) {
    case GbaInput.Up:
      return Direction.Up;
    case GbaInput.Right:
      return Direction.Right;
    case GbaInput.Down:
      return Direction.Down;
    case GbaInput.Left:
      return Direction.Left;
  }
  return undefined;
}

export function coerceDirection(input: GbaInput): Direction {
  return toDirection(input) ?? Direction.Up;
}

export function keyboardInputToGbaInput(keyboardInput: string): GbaInput | undefined {
  switch (keyboardInput) {
    case 'KeyW':
    case 'KeyI':
    case 'ArrowUp':
      return GbaInput.Up;
    case 'KeyD':
    case 'KeyL':
    case 'ArrowRight':
      return GbaInput.Right;
    case 'KeyS':
    case 'KeyK':
    case 'ArrowDown':
      return GbaInput.Down;
    case 'KeyA':
    case 'KeyJ':
    case 'ArrowLeft':
      return GbaInput.Left;
    case 'Space':
    case 'KeyX':
    case 'KeyM':
      return GbaInput.A;
    case 'KeyZ':
    case 'KeyN':
      return GbaInput.B;
    case 'Enter':
      return GbaInput.Start;
    case 'Backspace':
      return GbaInput.Select;
  }
  return undefined;
}
