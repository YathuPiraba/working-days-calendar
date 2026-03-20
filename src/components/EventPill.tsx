import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventPillProps } from "../types";
import { DEFAULT_COLOR, getForegroundColor } from "../utils";
import { DefaultTooltip } from "./ToolTip";

export function EventPill({
  event,
  trackIndex,
  dateKey,
  renderEvent,
  renderTooltip,
  onEventClick,
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
    <DefaultTooltip event={event} />
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Fire user-provided onEventClick first, then legacy event.onClick
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
