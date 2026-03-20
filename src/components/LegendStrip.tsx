// ---------------------------------------------------------------------------
// Dynamic legend
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import type { CalendarEvent } from "../types";
import { DEFAULT_COLOR } from "../utils";

export function LegendStrip({ events }: { events: CalendarEvent[] }) {
  const entries = useMemo(() => {
    const seen = new Set<string>();
    const result: { color: string; label: string }[] = [];
    for (const ev of events) {
      const color = ev.color ?? DEFAULT_COLOR;
      const key = `${color}::${ev.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ color, label: ev.label });
      }
    }
    return result;
  }, [events]);

  if (entries.length === 0) return null;

  return (
    <div className="wc-legend">
      {entries.map(({ color, label }) => (
        <div className="wc-legend-item" key={`${color}::${label}`}>
          <span className="wc-legend-dot" style={{ background: color }} />
          <span className="wc-legend-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
