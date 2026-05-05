// components/NumberPad.tsx

type NumberPadProps = {
  onNumber: (value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) => void;
  onClear: () => void;
  noteMode: boolean;
  onToggleNoteMode: () => void;
};

export default function NumberPad({
  onNumber,
  onClear,
  noteMode,
  onToggleNoteMode,
}: NumberPadProps) {
  return (
    <div className="w-full max-w-[min(90vw,460px)] mx-auto flex flex-col gap-3 mt-5">
      {/* Number buttons */}
      <div className="grid grid-cols-9 gap-[6px]">
        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((n) => (
          <button
            key={n}
            className="aspect-square rounded-xl font-bold text-[clamp(1rem,4vw,1.5rem)]
                       bg-[var(--color-numpad-bg)] text-[var(--color-numpad-text)]
                       hover:bg-[var(--color-numpad-hover)] active:scale-90
                       transition-all duration-150 cursor-pointer
                       shadow-sm hover:shadow-md"
            onClick={() => onNumber(n)}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-[6px]">
        <button
          className={`py-3 rounded-xl font-semibold text-sm
                      transition-all duration-150 cursor-pointer
                      active:scale-95 shadow-sm
                      ${
                        noteMode
                          ? "bg-[var(--color-accent)] text-white shadow-md"
                          : "bg-[var(--color-action-bg)] text-[var(--color-action-text)] hover:bg-[var(--color-action-hover)]"
                      }`}
          onClick={onToggleNoteMode}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            Notes {noteMode ? "ON" : "OFF"}
          </span>
        </button>

        <button
          className="py-3 rounded-xl font-semibold text-sm
                     bg-[var(--color-action-bg)] text-[var(--color-action-text)]
                     hover:bg-[var(--color-action-hover)] active:scale-95
                     transition-all duration-150 cursor-pointer shadow-sm"
          onClick={onClear}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
              <line x1="18" x2="12" y1="9" y2="15" />
              <line x1="12" x2="18" y1="9" y2="15" />
            </svg>
            Clear
          </span>
        </button>
      </div>
    </div>
  );
}
