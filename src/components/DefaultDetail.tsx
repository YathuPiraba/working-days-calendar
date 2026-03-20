import type { CalendarEvent } from "../types";
import { DEFAULT_COLOR } from "../utils";

export function DefaultDetail({
  event,
  onEventClick,
}: {
  event: CalendarEvent;
  onEventClick?: (event: CalendarEvent) => void;
}) {
  const color = event.color ?? DEFAULT_COLOR;

  return (
    <div className="wc-od-detail">
      {/* Color bar accent */}
      <div className="wc-od-detail-accent" style={{ background: color }} />

      <div className="wc-od-detail-body">
        {/* Title */}
        <div className="wc-od-detail-title-row">
          <span className="wc-od-detail-dot" style={{ background: color }} />
          <h3 className="wc-od-detail-title">{event.label}</h3>
        </div>

        {/* Data fields */}
        {event.data && Object.keys(event.data).length > 0 ? (
          <dl className="wc-od-detail-data">
            {Object.entries(event.data).map(([key, val]) => (
              <div className="wc-od-detail-row" key={key}>
                <dt className="wc-od-detail-key">{key}</dt>
                <dd className="wc-od-detail-val">
                  {typeof val === "object" ? JSON.stringify(val) : String(val)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="wc-od-detail-empty">No additional details</p>
        )}

        {/* User-facing click action */}
        {onEventClick && (
          <button
            className="wc-od-detail-action"
            style={{ borderColor: color, color }}
            onClick={() => onEventClick(event)}
          >
            Open event
          </button>
        )}
      </div>
    </div>
  );
}
