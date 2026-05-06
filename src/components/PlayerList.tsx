// components/PlayerList.tsx

import { SerializedPlayer, PLAYER_COLOR_MAP } from "@/types/multiplayer";

type PlayerListProps = {
  players: SerializedPlayer[];
  myPlayerId: string;
};

export default function PlayerList({ players, myPlayerId }: PlayerListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                     ${player.status === "disconnected" ? "opacity-40" : ""}
                     bg-[var(--color-action-bg)]`}
        >
          {/* Color dot */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: PLAYER_COLOR_MAP[player.color] }}
          />

          {/* Name */}
          <span className="text-[var(--color-action-text)]">
            {player.nickname}
            {player.id === myPlayerId && " (you)"}
          </span>

          {/* Status */}
          {player.status === "disconnected" && (
            <span className="text-[var(--color-text-muted)]">⏳</span>
          )}

          {/* Cells placed */}
          {player.cellsPlaced > 0 && (
            <span className="text-[var(--color-text-muted)]">
              · {player.cellsPlaced}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
