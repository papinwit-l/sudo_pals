// components/GameControls.tsx

import { Difficulty } from "@/types/sudoku";

type GameControlsProps = {
  difficulty: Difficulty;
  timer: number;
  onNewGame: (difficulty: Difficulty) => void;
  onUndo: () => void;
  onRedo: () => void;
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

export default function GameControls({
  difficulty,
  timer,
  onNewGame,
  onUndo,
  onRedo,
}: GameControlsProps) {
  return (
    <div className="w-full max-w-[min(90vw,460px)] mx-auto flex flex-col gap-3 mb-5">
      {/* Difficulty + Timer row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              className={`px-3.5 py-1.5 rounded-full capitalize text-xs font-semibold
                          transition-all duration-200 cursor-pointer
                          active:scale-95
                          ${
                            difficulty === d
                              ? "bg-[var(--color-accent)] text-white shadow-md"
                              : "bg-[var(--color-action-bg)] text-[var(--color-action-text)] hover:bg-[var(--color-action-hover)]"
                          }`}
              onClick={() => onNewGame(d)}
            >
              {difficultyEmoji[d]} {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-[var(--color-action-bg)] px-3.5 py-1.5 rounded-full">
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
            {formatTime(timer)}
          </span>
        </div>
      </div>

      {/* Undo / Redo row */}
      <div className="flex gap-1.5">
        <button
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold
                     bg-[var(--color-action-bg)] text-[var(--color-action-text)]
                     hover:bg-[var(--color-action-hover)] active:scale-95
                     transition-all duration-150 cursor-pointer"
          onClick={onUndo}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          </svg>
          Undo
        </button>

        <button
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold
                     bg-[var(--color-action-bg)] text-[var(--color-action-text)]
                     hover:bg-[var(--color-action-hover)] active:scale-95
                     transition-all duration-150 cursor-pointer"
          onClick={onRedo}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 14 20 9 15 4" />
            <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
          </svg>
          Redo
        </button>
      </div>
    </div>
  );
}
