// components/MultiplayerCell.tsx

import { SerializedCell } from "@/types/multiplayer";

type MultiplayerCellProps = {
  cell: SerializedCell;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameValue: boolean;
  ownerColor: string | null; // hex color of the player who placed this
  cursorColors: string[]; // hex colors of other players selecting this cell
  onClick: (row: number, col: number) => void;
};

export default function MultiplayerCell({
  cell,
  row,
  col,
  isSelected,
  isHighlighted,
  isSameValue,
  ownerColor,
  cursorColors,
  onClick,
}: MultiplayerCellProps) {
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

  // Text color: error > owner color > fixed
  const textColor = cell.isError
    ? "text-[var(--color-error)]"
    : cell.isFixed
      ? "text-[var(--color-text-fixed)]"
      : undefined;

  const textStyle =
    !cell.isError && !cell.isFixed && ownerColor
      ? { color: ownerColor }
      : undefined;

  // Show cursor indicator from other players
  const hasCursors = cursorColors.length > 0;

  return (
    <div
      className={`
        relative flex items-center justify-center
        aspect-square cursor-pointer select-none
        transition-colors duration-150
        active:scale-95 active:transition-transform
        ${borderRight} ${borderBottom} ${bg}
      `}
      onClick={() => onClick(row, col)}
    >
      {/* Other players' cursor indicators */}
      {hasCursors && (
        <div className="absolute inset-0 pointer-events-none">
          {cursorColors.map((color, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-sm opacity-25"
              style={{
                border: `2px solid ${color}`,
              }}
            />
          ))}
        </div>
      )}

      {cell.value ? (
        <span
          className={`text-[clamp(1rem,4.5vw,1.75rem)] font-bold ${textColor || ""}`}
          style={textStyle}
        >
          {cell.value}
        </span>
      ) : null}
    </div>
  );
}
