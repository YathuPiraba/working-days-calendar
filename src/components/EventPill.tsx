import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CalendarEvent, EventPillProps } from "../types";
import { DEFAULT_COLOR, getForegroundColor } from "../utils";
import {
  formatInTz,
  getUtcOffset,
  resolveEventTz,
  LOCAL_TZ,
} from "../utils/tz";

export default function EventPill({
  event,
  trackIndex,
  dateKey,
  renderEvent,
  renderTooltip,
  onEventClick,
  calendarTimezone,
}: EventPillProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const pillRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const color = event.color ?? DEFAULT_COLOR;
  const fg = useMemo(() => getForegroundColor(color), [color]);

  const handleMouseEnter = useCallback(() => setTooltipOpen(true), []);
  const handleMouseLeave = useCallback(() => setTooltipOpen(false), []);

  // Flip tooltip upward if near bottom of viewport
  useEffect(() => {
    if (!tooltipOpen || !pillRef.current || !tooltipRef.current) return;
    const pillRect = pillRef.current.getBoundingClientRect();
    const tipH = tooltipRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - pillRect.bottom;
    setTooltipStyle(
      spaceBelow < tipH + 12
        ? { bottom: "calc(100% + 6px)", top: "auto" }
        : { top: "calc(100% + 6px)", bottom: "auto" },
    );
  }, [tooltipOpen]);

  const ctx = { dateKey, trackIndex, tooltipOpen };

  const pillContent = renderEvent ? (
    renderEvent(event, ctx)
  ) : (
    <div className="wc-event-pill" style={{ background: color, color: fg }}>
      <span className="wc-event-label">{event.label}</span>
    </div>
  );

  const tooltipContent = renderTooltip ? (
    renderTooltip(event)
  ) : (
    <DefaultTooltip event={event} calendarTimezone={calendarTimezone} />
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEventClick?.(event);
      event.onClick?.(event);
    },
    [event, onEventClick],
  );

  return (
    <div
      ref={pillRef}
      className="wc-event-track"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {pillContent}

      {tooltipOpen && (
        <div
          ref={tooltipRef}
          className="wc-tooltip"
          style={tooltipStyle}
          role="tooltip"
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default tooltip
// ---------------------------------------------------------------------------

function DefaultTooltip({
  event,
  calendarTimezone,
}: {
  event: CalendarEvent;
  calendarTimezone?: string;
}) {
  const color = event.color ?? DEFAULT_COLOR;
  const tz = resolveEventTz(event.timezone, calendarTimezone);
  const showTz = tz !== LOCAL_TZ || event.timezone;
  const utcOffset = showTz ? getUtcOffset(tz) : null;
  // Format the event time if the date includes a time component
  const timeStr =
    typeof event.date === "string" && event.date.includes("T")
      ? formatInTz(event.date, tz, "MMM d, yyyy · h:mm a")
      : null;

  return (
    <div className="wc-tooltip-inner">
      <div className="wc-tooltip-header">
        <span className="wc-tooltip-dot" style={{ background: color }} />
        <span className="wc-tooltip-title">{event.label}</span>
      </div>

      {/* Timezone badge */}
      {showTz && (
        <div className="wc-tooltip-tz">
          <span className="wc-tooltip-tz-name">{tz}</span>
          {utcOffset && (
            <span className="wc-tooltip-tz-offset">{utcOffset}</span>
          )}
        </div>
      )}

      {/* Formatted time */}
      {timeStr && <div className="wc-tooltip-time">{timeStr}</div>}

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
