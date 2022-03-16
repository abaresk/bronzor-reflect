// TODO: Consider adding another state: MARKED_MAYBE_BRONZOR. This allows the
// player to differentiate potential Bronzor locations from certain Bronzors.
export enum MemoState {
  UNMARKED,
  MARKED_NOT_BRONZOR,
  MARKED_BRONZOR,
};

export const MEMO_STATES: ReadonlyArray<MemoState> = [
  MemoState.UNMARKED,
  MemoState.MARKED_NOT_BRONZOR,
  MemoState.MARKED_BRONZOR,
];

export const MEMO_DISLAYS: ReadonlyMap<string, string> = new Map([
  [MemoState.UNMARKED.toString(), ''],
  [MemoState.MARKED_NOT_BRONZOR.toString(), 'x'],
  [MemoState.MARKED_BRONZOR.toString(), 'b'],
]);
