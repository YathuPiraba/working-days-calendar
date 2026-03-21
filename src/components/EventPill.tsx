import { useCallback, useMemo, useRef, useState } from "react";
import type { EventPillProps } from "../types";
import { DEFAULT_COLOR, getForegroundColor } from "../utils";
import SpanPill from "./SpanPill";
import DefaultTooltip from "./DefaultTooltip";
import TooltipPortal from "./TooltipPortal";
import { useTooltipPosition } from "../hooks/useTooltipPosition";

export default function EventPill({
  event,
  trackIndex,
  dateKey,
  spanRole = "solo",
  cellsRemainingInRow = 1,
  renderEvent,
  renderTooltip,
  onEventClick,
  calendarTimezone,
}: EventPillProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const color = event.color ?? DEFAULT_COLOR;
  const fg = useMemo(() => getForegroundColor(color), [color]);

  const isContinuation = spanRole === "mid";
  const showLabel = spanRole !== "mid" && spanRole !== "end";
  const showTooltip = spanRole !== "mid";

  const handleMouseEnter = useCallback(() => {
    if (showTooltip) setTooltipOpen(true);
  }, [showTooltip]);

  const handleMouseLeave = useCallback(() => setTooltipOpen(false), []);

  const tooltipStyle = useTooltipPosition(tooltipOpen, pillRef, tooltipRef);

  const ctx = { dateKey, trackIndex, tooltipOpen };

  const pillContent =
    renderEvent && !isContinuation && showLabel ? (
      renderEvent(event, ctx)
    ) : (
      <SpanPill
        color={color}
        fg={fg}
        label={event.label}
        spanRole={spanRole}
        cellsRemainingInRow={cellsRemainingInRow}
        showLabel={showLabel}
      />
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
    <>
      <div
        ref={pillRef}
        className={`wc-event-track wc-span-${spanRole}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {pillContent}
      </div>

      {showTooltip && (
        <TooltipPortal open={tooltipOpen}>
          <div
            ref={tooltipRef}
            className="wc-tooltip"
            style={tooltipStyle}
            role="tooltip"
          >
            {tooltipContent}
          </div>
        </TooltipPortal>
      )}
    </>
  );
}
