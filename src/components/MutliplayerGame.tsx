// components/MultiplayerGame.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRoom } from "@/hooks/useRoom";
import { ConnectionStatus } from "@/hooks/useSocket";
import MultiplayerBoard from "./MultiplayerBoard";
import NumberPad from "./NumberPad";
import PlayerList from "./PlayerList";
import CompletionStats from "./CompletionStats";
import { Difficulty, CellValue, Position } from "@/types/sudoku";
import { RoomState } from "@/types/multiplayer";

type MultiplayerGameProps = {
  code: string;
  onBack: () => void;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const difficultyEmoji: Record<Difficulty, string> = {
  easy: "🌸",
  medium: "🌼",
  hard: "🔥",
};

export default function MultiplayerGame({
  code,
  onBack,
}: MultiplayerGameProps) {
  const {
    roomState,
    connectionStatus,
    error,
    placeNumber,
    clearCell,
    selectCell,
    newGame,
    leaveRoom,
  } = useRoom();

  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [noteMode, setNoteMode] = useState(false);

  function handleCellClick(row: number, col: number) {
    setSelectedCell({ row, col });
    selectCell(row, col);
  }

  function handleNumber(value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
    if (!selectedCell || !roomState) return;

    // Block fixed cells
    if (roomState.board[selectedCell.row][selectedCell.col].isFixed) return;

    // In multiplayer, notes are not synced — skip for now
    if (noteMode) return;

    placeNumber(selectedCell.row, selectedCell.col, value);
  }

  function handleClear() {
    if (!selectedCell || !roomState) return;
    if (roomState.board[selectedCell.row][selectedCell.col].isFixed) return;

    clearCell(selectedCell.row, selectedCell.col);
  }

  function handleNewGame() {
    if (!roomState) return;
    newGame(roomState.difficulty, roomState.validationMode);
  }

  function handleLeave() {
    leaveRoom();
    onBack();
  }

  // Keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        handleNumber(num as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        handleClear();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Loading / error states
  if (!roomState) {
    return (
      <div className="sudoku-theme flex flex-col items-center w-full px-4 py-6 max-w-lg mx-auto min-h-screen justify-center">
        <button
          className="self-start text-sm text-[var(--color-action-text)] hover:underline cursor-pointer mb-4"
          onClick={onBack}
        >
          ← Home
        </button>

        {error ? (
          <div className="text-center">
            <p className="text-[var(--color-error)] font-semibold mb-2">
              {error}
            </p>
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold
                         bg-[var(--color-accent)] text-white
                         hover:opacity-90 active:scale-95
                         transition-all duration-150 cursor-pointer"
              onClick={onBack}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="text-[var(--color-text-muted)]">
            {connectionStatus === "connected"
              ? "Joining room..."
              : "Connecting to server..."}
          </div>
        )}
      </div>
    );
  }

  const isCreator = roomState.players.some(
    (p) => p.id === roomState.myPlayerId,
  );

  return (
    <div className="sudoku-theme flex flex-col items-center w-full px-4 py-6 max-w-lg mx-auto min-h-screen justify-center">
      {/* Header */}
      <div className="w-full max-w-[min(90vw,460px)] mx-auto mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            className="text-sm text-[var(--color-action-text)] hover:underline cursor-pointer"
            onClick={handleLeave}
          >
            ← Leave
          </button>

          <div className="flex items-center gap-2">
            {/* Room code */}
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold
                           bg-[var(--color-action-bg)] text-[var(--color-action-text)]"
            >
              {roomState.code}
            </span>

            {/* Seed indicator */}
            <span className="text-sm" title={`Seed: ${roomState.seed}`}>
              {roomState.isCustomSeed ? "🎯" : "🎲"}
            </span>
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Difficulty */}
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                           bg-[var(--color-action-bg)] text-[var(--color-action-text)]"
            >
              {difficultyEmoji[roomState.difficulty]} {roomState.difficulty}
            </span>

            {/* Validation mode */}
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold
                           bg-[var(--color-action-bg)] text-[var(--color-action-text)]"
            >
              {roomState.validationMode === "conflict" ? "⚔️" : "🎯"}{" "}
              {roomState.validationMode}
            </span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-[var(--color-action-bg)] px-3 py-1 rounded-full">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-action-text)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-mono text-sm font-semibold text-[var(--color-action-text)]">
              {formatTime(roomState.timer)}
            </span>
          </div>
        </div>

        {/* Player list */}
        <PlayerList
          players={roomState.players}
          myPlayerId={roomState.myPlayerId}
        />
      </div>

      {/* Connection banner */}
      {connectionStatus !== "connected" && (
        <div
          className="mb-3 w-full max-w-[min(90vw,460px)] py-2 px-4 rounded-xl text-center
                        bg-amber-100 text-amber-800 text-xs font-medium
                        dark:bg-amber-900/30 dark:text-amber-300"
        >
          {connectionStatus === "connecting"
            ? "🔄 Reconnecting..."
            : "⚠️ Disconnected — trying to reconnect..."}
        </div>
      )}

      {/* Completion stats */}
      {roomState.isComplete && roomState.completionStats ? (
        <CompletionStats
          stats={roomState.completionStats.stats}
          time={roomState.completionStats.time}
          onNewGame={handleNewGame}
          isCreator={isCreator}
        />
      ) : (
        <>
          {/* Board */}
          <MultiplayerBoard
            board={roomState.board}
            selectedCell={selectedCell}
            players={roomState.players}
            myPlayerId={roomState.myPlayerId}
            cellOwners={roomState.cellOwners}
            onCellClick={handleCellClick}
          />

          {/* Number pad */}
          <NumberPad
            onNumber={handleNumber}
            onClear={handleClear}
            noteMode={noteMode}
            onToggleNoteMode={() => setNoteMode(!noteMode)}
          />
        </>
      )}

      {/* Seed display */}
      <p className="mt-6 text-[10px] text-[var(--color-text-muted)] tracking-wide">
        SEED: {roomState.seed}
      </p>
    </div>
  );
}
