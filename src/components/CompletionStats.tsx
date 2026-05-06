// components/CompletionStats.tsx

import { PlayerStats, PLAYER_COLOR_MAP } from "@/types/multiplayer";

type CompletionStatsProps = {
  stats: PlayerStats[];
  time: number;
  onNewGame?: () => void;
  isCreator: boolean;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CompletionStats({
  stats,
  time,
  onNewGame,
  isCreator,
}: CompletionStatsProps) {
  // Sort by cells placed (descending)
  const sorted = [...stats].sort((a, b) => b.cellsPlaced - a.cellsPlaced);
  const totalCells = sorted.reduce((sum, s) => sum + s.cellsPlaced, 0);

  return (
    <div className="w-full max-w-[min(90vw,460px)] mx-auto">
      <div
        className="rounded-2xl p-5 text-center
                    bg-[var(--color-success-bg)] text-[var(--color-success-text)]
                    shadow-lg"
      >
        <div className="text-2xl mb-1">🎉</div>
        <h2 className="text-lg font-extrabold mb-1">Puzzle Complete!</h2>
        <p className="text-sm font-mono mb-4">⏱ {formatTime(time)}</p>

        {/* Player stats */}
        <div className="flex flex-col gap-2 mb-4">
          {sorted.map((player, i) => {
            const percentage =
              totalCells > 0
                ? Math.round((player.cellsPlaced / totalCells) * 100)
                : 0;

            return (
              <div
                key={player.playerId}
                className="flex items-center gap-2 text-sm"
              >
                {/* Rank */}
                <span className="w-5 text-right font-bold">
                  {i === 0 ? "👑" : `${i + 1}.`}
                </span>

                {/* Color dot */}
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: PLAYER_COLOR_MAP[player.color] }}
                />

                {/* Name */}
                <span className="font-semibold flex-1 text-left">
                  {player.nickname}
                </span>

                {/* Bar */}
                <div className="w-20 h-2 rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: PLAYER_COLOR_MAP[player.color],
                    }}
                  />
                </div>

                {/* Count */}
                <span className="w-8 text-right font-mono text-xs">
                  {player.cellsPlaced}
                </span>
              </div>
            );
          })}
        </div>

        {/* New game button (creator only) */}
        {isCreator && onNewGame && (
          <button
            className="px-6 py-2 rounded-xl text-sm font-bold
                       bg-[var(--color-accent)] text-white shadow-md
                       hover:opacity-90 active:scale-95
                       transition-all duration-150 cursor-pointer"
            onClick={onNewGame}
          >
            🎲 New Game
          </button>
        )}
        {!isCreator && (
          <p className="text-xs opacity-70">
            Waiting for room creator to start a new game...
          </p>
        )}
      </div>
    </div>
  );
}
