import { Cell } from "src/app/common/cell";
import { Coord } from "src/app/common/geometry/coord";
import { Beam, cometBeam, doublePrizeBeam, shadowBeam, psyBeam, normalBeam, waterBeam, flameBeam, flashCannonBeam, getPrizeTextMini } from "src/app/common/prizes";

export interface BeamMove {
  beam: Beam;
  moveIndex: number;
}

export enum EmitType {
  Emit,
  Hit,
  Reflect,
};

export interface CellInput {
  beamMove: BeamMove;
  emitType: EmitType;
};

export interface CellOutput {
  outputs: BeamMove[];
};

export interface IOState {
  input?: CellInput;
  output: CellOutput;
};

export function newIOState(): IOState {
  return { output: { outputs: [] } };
}

const EMIT_TYPE_TEXT: ReadonlyMap<EmitType, string> = new Map([
  [EmitType.Emit, ''],
  [EmitType.Hit, ' - hit'],
  [EmitType.Reflect, ' - reflect'],
]);

function getBeamMoveText(beamMove?: BeamMove): string {
  if (!beamMove) return '';

  const beamText = getPrizeTextMini(beamMove.beam);
  const moveNumberText = beamMove.moveIndex + 1;
  return `${beamText}${moveNumberText}`;
}

function getInputText(input?: CellInput): string {
  if (!input) return '';

  const beamMoveText = getBeamMoveText(input.beamMove);
  const emitTypeText = EMIT_TYPE_TEXT.get(input.emitType) ?? '';
  return `In: ${beamMoveText}${emitTypeText}`;
}

function getOutputText(output: CellOutput): string {
  if (output.outputs.length === 0) return '';

  const beamMoves = output.outputs.map((beamMove) => getBeamMoveText(beamMove));
  return `Out: ${beamMoves.join(', ')}`;
}

export class IOCell extends Cell {
  static CATEGORY = 'io-cell';
  coord: Coord;
  validateSelection?: (coord: Coord) => boolean;
  ioState: IOState = newIOState();

  constructor(coord: Coord, validateSelection: (coord: Coord) => boolean) {
    super();
    this.coord = coord;
    this.validateSelection = validateSelection;
  }

  override validSelection(): boolean {
    if (!this.validateSelection) return false;

    return this.validateSelection(this.coord);
  }

  // Get text representation of the cell
  override getText(jackpotsCollected: number): string {
    const inputText = getInputText(this.ioState.input);
    const outputText = getOutputText(this.ioState.output);
    return `${inputText}\n${outputText}`;
  }

  override getCategory(): string {
    return IOCell.CATEGORY;
  }
}

