import { useRef } from "react";
import type { OverflowChipProps } from "../types";

export function OverflowChip({
  dayKey: _dayKey,
  hiddenCount,
  allCellEvents: _all,
  onOpen,
}: OverflowChipProps) {
  const chipRef = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={chipRef}
      className="wc-overflow-chip"
      onClick={(e) => {
        e.stopPropagation();
        onOpen(chipRef as React.RefObject<HTMLButtonElement>);
      }}
      aria-label={`${hiddenCount} more events`}
    >
      +{hiddenCount} more
    </button>
  );
}
