// components/Cell.tsx

import { Cell as CellType } from "@/types/sudoku";

type CellProps = {
  cell: CellType;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameValue: boolean;
  onClick: (row: number, col: number) => void;
};

export default function Cell({
  cell,
  row,
  col,
  isSelected,
  isHighlighted,
  isSameValue,
  onClick,
}: CellProps) {
  // Thicker borders for 3x3 box edges
  const borderRight =
    col === 2 || col === 5
      ? "border-r-[2.5px] border-r-[var(--color-grid-thick)]"
      : col === 8
        ? ""
        : "border-r border-r-[var(--color-grid-thin)]";

  const borderBottom =
    row === 2 || row === 5
      ? "border-b-[2.5px] border-b-[var(--color-grid-thick)]"
      : row === 8
        ? ""
        : "border-b border-b-[var(--color-grid-thin)]";

  const bg = isSelected
    ? "bg-[var(--color-cell-selected)]"
    : isSameValue
      ? "bg-[var(--color-cell-same-value)]"
      : isHighlighted
        ? "bg-[var(--color-cell-highlighted)]"
        : "bg-[var(--color-cell-bg)]";

  const textColor = cell.isError
    ? "text-[var(--color-error)]"
    : cell.isFixed
      ? "text-[var(--color-text-fixed)]"
      : "text-[var(--color-text-placed)]";

  return (
    <div
      className={`
        flex items-center justify-center
        aspect-square cursor-pointer select-none
        transition-colors duration-150
        active:scale-95 active:transition-transform
        ${borderRight} ${borderBottom} ${bg}
      `}
      onClick={() => onClick(row, col)}
    >
      {cell.value ? (
        <span
          className={`text-[clamp(1rem,4.5vw,1.75rem)] font-bold ${textColor}`}
        >
          {cell.value}
        </span>
      ) : cell.notes.size > 0 ? (
        <div className="grid grid-cols-3 w-full h-full p-[1px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              className="text-[clamp(0.4rem,1.5vw,0.65rem)] text-[var(--color-text-notes)] flex items-center justify-center font-medium"
            >
              {cell.notes.has(n) ? n : ""}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
