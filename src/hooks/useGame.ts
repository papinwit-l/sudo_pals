// hooks/useGame.ts

import { useReducer, useCallback, useEffect } from "react";
import { GameState, GameAction, Board, Difficulty } from "@/types/sudoku";
import { validateBoard } from "@/utils/validation";
import { generateSeed } from "@/utils/random";
import { generatePuzzle } from "@/utils/generator";
import { loadState, saveState } from "@/utils/storage";

type FullState = GameState & {
  history: Board[];
  historyIndex: number;
};

function isBoardComplete(board: Board): boolean {
  return board.every((row) =>
    row.every((cell) => cell.value !== null && !cell.isError),
  );
}

function pushHistory(state: FullState, board: Board): FullState {
  // Discard any redo history after current index
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(
    board.map((row) =>
      row.map((cell) => ({ ...cell, notes: new Set(cell.notes) })),
    ),
  );

  return {
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

function cloneBoard(board: Board): Board {
  return board.map((row) =>
    row.map((cell) => ({ ...cell, notes: new Set(cell.notes) })),
  );
}

function gameReducer(state: FullState, action: GameAction): FullState {
  switch (action.type) {
    case "SELECT_CELL": {
      return {
        ...state,
        selectedCell: { row: action.row, col: action.col },
      };
    }

    case "PLACE_NUMBER": {
      if (!state.selectedCell) return state;

      const { row, col } = state.selectedCell;
      const cell = state.board[row][col];

      // Can't edit fixed cells
      if (cell.isFixed) return state;

      const newBoard = cloneBoard(state.board);
      newBoard[row][col] = {
        ...newBoard[row][col],
        value: action.value,
        notes: new Set(),
      };

      const validated = validateBoard(newBoard);
      const newState = pushHistory(state, validated);

      return {
        ...newState,
        board: validated,
        isComplete: isBoardComplete(validated),
      };
    }

    case "TOGGLE_NOTE": {
      if (!state.selectedCell) return state;

      const { row, col } = state.selectedCell;
      const cell = state.board[row][col];

      // Can't add notes to fixed or filled cells
      if (cell.isFixed || cell.value !== null) return state;

      const newBoard = cloneBoard(state.board);
      const notes = new Set(cell.notes);

      if (notes.has(action.value)) {
        notes.delete(action.value);
      } else {
        notes.add(action.value);
      }

      newBoard[row][col] = { ...newBoard[row][col], notes };

      const newState = pushHistory(state, newBoard);
      return { ...newState, board: newBoard };
    }

    case "CLEAR_CELL": {
      if (!state.selectedCell) return state;

      const { row, col } = state.selectedCell;
      const cell = state.board[row][col];

      if (cell.isFixed) return state;

      const newBoard = cloneBoard(state.board);
      newBoard[row][col] = {
        ...newBoard[row][col],
        value: null,
        notes: new Set(),
        isError: false,
      };

      const validated = validateBoard(newBoard);
      const newState = pushHistory(state, validated);

      return { ...newState, board: validated };
    }

    case "UNDO": {
      if (state.historyIndex <= 0) return state;

      const newIndex = state.historyIndex - 1;
      const board = cloneBoard(state.history[newIndex]);

      return {
        ...state,
        board,
        historyIndex: newIndex,
      };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;

      const newIndex = state.historyIndex + 1;
      const board = cloneBoard(state.history[newIndex]);

      return {
        ...state,
        board,
        historyIndex: newIndex,
      };
    }

    case "NEW_GAME": {
      const seed = action.seed ?? generateSeed();
      const board = generatePuzzle(action.difficulty, seed);
      return {
        ...state,
        board,
        difficulty: action.difficulty,
        selectedCell: null,
        isComplete: false,
        timer: 0,
        seed,
        history: [cloneBoard(board)],
        historyIndex: 0,
      };
    }

    case "RESTORE_STATE": {
      return action.savedState;
    }

    case "SET_BOARD": {
      return {
        ...state,
        board: action.board,
        history: [cloneBoard(action.board)],
        historyIndex: 0,
      };
    }

    case "TICK_TIMER": {
      if (state.isComplete) return state;
      return { ...state, timer: state.timer + 1 };
    }

    default:
      return state;
  }
}

function createInitialState(difficulty: Difficulty, seed?: number): FullState {
  const saved = loadState();

  // Only restore if same difficulty and seed
  if (saved && saved.difficulty === difficulty && saved.seed === seed) {
    return saved;
  }

  const actualSeed = seed ?? generateSeed();
  const board = generatePuzzle(difficulty, actualSeed);
  return {
    board,
    difficulty,
    selectedCell: null,
    isComplete: false,
    timer: 0,
    seed: actualSeed,
    history: [cloneBoard(board)],
    historyIndex: 0,
  };
}

export function useGame(
  initialDifficulty: Difficulty = "easy",
  initialSeed?: number,
) {
  const [state, dispatch] = useReducer(
    gameReducer,
    { difficulty: initialDifficulty, seed: initialSeed },
    (init) => createInitialState(init.difficulty, init.seed),
  );

  // Restore saved state after hydration
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: "RESTORE_STATE", savedState: saved });
    }
  }, []);

  // Auto-save on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const selectCell = useCallback(
    (row: number, col: number) => dispatch({ type: "SELECT_CELL", row, col }),
    [],
  );

  const placeNumber = useCallback(
    (value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) =>
      dispatch({ type: "PLACE_NUMBER", value }),
    [],
  );

  const toggleNote = useCallback(
    (value: number) => dispatch({ type: "TOGGLE_NOTE", value }),
    [],
  );

  const clearCell = useCallback(() => dispatch({ type: "CLEAR_CELL" }), []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const newGame = useCallback(
    (difficulty: Difficulty, seed?: number) =>
      dispatch({ type: "NEW_GAME", difficulty, seed }),
    [],
  );

  const tickTimer = useCallback(() => dispatch({ type: "TICK_TIMER" }), []);

  return {
    ...state,
    selectCell,
    placeNumber,
    toggleNote,
    clearCell,
    undo,
    redo,
    newGame,
    tickTimer,
  };
}
