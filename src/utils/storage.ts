// utils/storage.ts

import { Board } from "@/types/sudoku";

const STORAGE_KEY = "sudoku-game-state";

type SerializableState = {
  board: any[][];
  difficulty: string;
  selectedCell: { row: number; col: number } | null;
  isComplete: boolean;
  timer: number;
  seed: number;
  history: any[][][];
  historyIndex: number;
};

export function saveState(state: any) {
  if (typeof window === "undefined") return;

  try {
    const serializable: SerializableState = {
      ...state,
      board: state.board.map((row: any[]) =>
        row.map((cell: any) => ({
          ...cell,
          notes: Array.from(cell.notes),
        })),
      ),
      history: state.history.map((board: any[][]) =>
        board.map((row: any[]) =>
          row.map((cell: any) => ({
            ...cell,
            notes: Array.from(cell.notes),
          })),
        ),
      ),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Storage full or unavailable
  }
}

export function loadState(): any | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);

    parsed.board = parsed.board.map((row: any[]) =>
      row.map((cell: any) => ({
        ...cell,
        notes: new Set(cell.notes),
      })),
    );

    parsed.history = parsed.history.map((board: any[][]) =>
      board.map((row: any[]) =>
        row.map((cell: any) => ({
          ...cell,
          notes: new Set(cell.notes),
        })),
      ),
    );

    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
