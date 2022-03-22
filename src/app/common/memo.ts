export enum MemoState {
  UNMARKED,
  NOT_BRONZOR,
  MAYBE_BRONZOR,
  BRONZOR,
};

export const MEMO_STATES: ReadonlyArray<MemoState> = [
  MemoState.UNMARKED,
  MemoState.NOT_BRONZOR,
  MemoState.MAYBE_BRONZOR,
  MemoState.BRONZOR,
];

export const MEMO_DISLAYS: ReadonlyMap<string, string> = new Map([
  [MemoState.UNMARKED.toString(), ''],
  [MemoState.NOT_BRONZOR.toString(), 'x'],
  [MemoState.MAYBE_BRONZOR.toString(), 'b?'],
  [MemoState.BRONZOR.toString(), 'b'],
]);
