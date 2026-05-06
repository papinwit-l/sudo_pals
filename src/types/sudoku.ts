// types/sudoku.ts

export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null;

export type Cell = {
  value: CellValue;
  isFixed: boolean;
  notes: Set<number>;
  isError: boolean;
};

export type Board = Cell[][];

export type Difficulty = "easy" | "medium" | "hard";

export type Position = {
  row: number;
  col: number;
};

export type GameState = {
  board: Board;
  difficulty: Difficulty;
  selectedCell: Position | null;
  isComplete: boolean;
  timer: number;
  seed: number;
};

export type FullState = GameState & {
  history: Board[];
  historyIndex: number;
};

export type GameAction =
  | { type: "SELECT_CELL"; row: number; col: number }
  | { type: "PLACE_NUMBER"; value: CellValue }
  | { type: "TOGGLE_NOTE"; value: number }
  | { type: "CLEAR_CELL" }
  | { type: "NEW_GAME"; difficulty: Difficulty; seed?: number }
  | { type: "SET_BOARD"; board: Board }
  | { type: "RESTORE_STATE"; savedState: FullState }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "TICK_TIMER" };
