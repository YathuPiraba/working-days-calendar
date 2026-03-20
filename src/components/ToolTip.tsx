// ---------------------------------------------------------------------------
// Default tooltip
// ---------------------------------------------------------------------------
import type { CalendarEvent } from "../types";
import { DEFAULT_COLOR } from "../utils";

export function DefaultTooltip({ event }: { event: CalendarEvent }) {
  return (
    <div className="wc-tooltip-inner">
      <div className="wc-tooltip-header">
        <span
          className="wc-tooltip-dot"
          style={{ background: event.color ?? DEFAULT_COLOR }}
        />
        <span className="wc-tooltip-title">{event.label}</span>
      </div>
      {event.data && Object.keys(event.data).length > 0 && (
        <dl className="wc-tooltip-data">
          {Object.entries(event.data).map(([key, val]) => (
            <div className="wc-tooltip-row" key={key}>
              <dt className="wc-tooltip-key">{key}</dt>
              <dd className="wc-tooltip-val">
                {typeof val === "object" ? JSON.stringify(val) : String(val)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
