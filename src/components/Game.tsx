// components/Game.tsx

"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/hooks/useGame";
import Board from "./Board";
import NumberPad from "./NumberPad";
import GameControls from "./GameControls";
import { Difficulty } from "@/types/sudoku";
import { useRouter } from "next/router";
import { generateSeed } from "@/utils/random";

type GameProps = {
  difficulty: Difficulty;
  seed: number;
  onNewGame: (difficulty: Difficulty) => void;
};

export default function Game({ difficulty, seed, onNewGame }: GameProps) {
  const {
    board,
    selectedCell,
    timer,
    isComplete,
    selectCell,
    placeNumber,
    toggleNote,
    clearCell,
    undo,
    redo,
    newGame,
    tickTimer,
  } = useGame(difficulty, seed);

  const [noteMode, setNoteMode] = useState(false);

  // Timer
  useEffect(() => {
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  // Keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        if (noteMode) {
          toggleNote(num);
        } else {
          placeNumber(num as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
        }
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        clearCell();
      }
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
      }
      if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [noteMode, placeNumber, toggleNote, clearCell, undo, redo]);

  function handleNumber(value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    if (noteMode) {
      toggleNote(value);
    } else {
      placeNumber(value);
    }
  }

  return (
    <div className="sudoku-theme flex flex-col items-center w-full px-4 py-6 max-w-lg mx-auto min-h-screen justify-center">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl">🧩</span>
        <h1 className="text-[clamp(1.5rem,5vw,2.25rem)] font-extrabold tracking-tight text-[var(--color-title)]">
          Sudoku
        </h1>
      </div>

      {/* Win banner */}
      {isComplete && (
        <div
          className="mb-5 w-full max-w-[min(90vw,460px)] mx-auto py-3 px-4 rounded-2xl text-center
                      bg-[var(--color-success-bg)] text-[var(--color-success-text)]
                      font-bold text-sm shadow-md animate-bounce"
        >
          🎉 Puzzle Complete! Well done!
        </div>
      )}

      <GameControls
        difficulty={difficulty}
        timer={timer}
        onNewGame={onNewGame}
        onUndo={undo}
        onRedo={redo}
      />

      <Board
        board={board}
        selectedCell={selectedCell}
        onCellClick={selectCell}
      />

      <NumberPad
        onNumber={handleNumber}
        onClear={clearCell}
        noteMode={noteMode}
        onToggleNoteMode={() => setNoteMode(!noteMode)}
      />

      {/* Seed display */}
      <p className="mt-6 text-[10px] text-[var(--color-text-muted)] tracking-wide">
        SEED: {seed}
      </p>
    </div>
  );
}
