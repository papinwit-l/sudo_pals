// components/MultiplayerBoard.tsx

import {
  SerializedBoard,
  SerializedPlayer,
  PLAYER_COLOR_MAP,
} from "@/types/multiplayer";
import { Position } from "@/types/sudoku";
import MultiplayerCell from "./MultiplayerCell";

type MultiplayerBoardProps = {
  board: SerializedBoard;
  selectedCell: Position | null;
  players: SerializedPlayer[];
  myPlayerId: string;
  cellOwners: Record<string, string>; // "row,col" -> playerId
  onCellClick: (row: number, col: number) => void;
};

export default function MultiplayerBoard({
  board,
  selectedCell,
  players,
  myPlayerId,
  cellOwners,
  onCellClick,
}: MultiplayerBoardProps) {
  // Build player color lookup: playerId -> hex color
  const playerColorMap = new Map<string, string>();
  for (const player of players) {
    playerColorMap.set(player.id, PLAYER_COLOR_MAP[player.color]);
  }

  // Build cursor lookup: "row,col" -> hex colors of other players selecting that cell
  const cursorMap = new Map<string, string[]>();
  for (const player of players) {
    if (player.id === myPlayerId || !player.selectedCell) continue;
    const key = `${player.selectedCell.row},${player.selectedCell.col}`;
    const existing = cursorMap.get(key) || [];
    existing.push(PLAYER_COLOR_MAP[player.color]);
    cursorMap.set(key, existing);
  }

  function isHighlighted(row: number, col: number): boolean {
    if (!selectedCell) return false;
    if (selectedCell.row === row && selectedCell.col === col) return false;

    const sameRow = selectedCell.row === row;
    const sameCol = selectedCell.col === col;
    const sameBox =
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(col / 3);

    return sameRow || sameCol || sameBox;
  }

  function isSameValue(row: number, col: number): boolean {
    if (!selectedCell) return false;
    if (selectedCell.row === row && selectedCell.col === col) return false;

    const selectedValue = board[selectedCell.row][selectedCell.col].value;
    const cellValue = board[row][col].value;

    return (
      selectedValue !== null &&
      cellValue !== null &&
      selectedValue === cellValue
    );
  }

  return (
    <div className="w-full max-w-[min(90vw,460px)] mx-auto">
      <div
        className="grid grid-cols-9 rounded-2xl overflow-hidden border-[3px] border-[var(--color-grid-thick)] shadow-lg"
        style={{ boxShadow: "0 8px 32px var(--color-board-shadow)" }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const cellKey = `${r},${c}`;
            const ownerId = cellOwners[cellKey];
            const ownerColor = ownerId
              ? playerColorMap.get(ownerId) || null
              : null;
            const cursorColors = cursorMap.get(cellKey) || [];

            return (
              <MultiplayerCell
                key={cellKey}
                cell={cell}
                row={r}
                col={c}
                isSelected={selectedCell?.row === r && selectedCell?.col === c}
                isHighlighted={isHighlighted(r, c)}
                isSameValue={isSameValue(r, c)}
                ownerColor={ownerColor}
                cursorColors={cursorColors}
                onClick={onCellClick}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
