// components/Board.tsx

import { Board as BoardType, Position } from "@/types/sudoku";
import Cell from "./Cell";

type BoardProps = {
  board: BoardType;
  selectedCell: Position | null;
  onCellClick: (row: number, col: number) => void;
};

export default function Board({
  board,
  selectedCell,
  onCellClick,
}: BoardProps) {
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
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              row={r}
              col={c}
              isSelected={selectedCell?.row === r && selectedCell?.col === c}
              isHighlighted={isHighlighted(r, c)}
              isSameValue={isSameValue(r, c)}
              onClick={onCellClick}
            />
          )),
        )}
      </div>
    </div>
  );
}
