import {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  getWeek,
  isToday,
  isWeekend,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import "./WorkingCalendar.css";
import MiniCalendar from "./MiniCalendar";

import {
  type CalendarEvent,
  type EventPillProps,
  type WorkingCalendarProps,
} from "../types";
import {
  DEFAULT_COLOR,
  DEFAULT_MAX_VISIBLE,
  getForegroundColor,
  normalizeToDateKey,
  validateEvents,
  WEEKDAYS,
} from "../utils";

// ---------------------------------------------------------------------------
// Default tooltip
// ---------------------------------------------------------------------------

function DefaultTooltip({ event }: { event: CalendarEvent }) {
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

// ---------------------------------------------------------------------------
// EventPill
// ---------------------------------------------------------------------------

function EventPill({
  event,
  trackIndex,
  dateKey,
  renderEvent,
  renderTooltip,
}: EventPillProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const pillRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const color = event.color ?? DEFAULT_COLOR;
  const fg = useMemo(() => getForegroundColor(color), [color]);

  const handleMouseEnter = useCallback(() => setTooltipOpen(true), []);
  const handleMouseLeave = useCallback(() => setTooltipOpen(false), []);

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

  const pillContent: ReactNode = renderEvent ? (
    renderEvent(event, ctx)
  ) : (
    <div className="wc-event-pill" style={{ background: color, color: fg }}>
      <span className="wc-event-label">{event.label}</span>
    </div>
  );

  const tooltipContent: ReactNode = renderTooltip ? (
    renderTooltip(event)
  ) : (
    <DefaultTooltip event={event} />
  );

  return (
    <div
      ref={pillRef}
      className="wc-event-track"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        event.onClick?.(event);
      }}
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
// Dynamic legend
// ---------------------------------------------------------------------------

function LegendStrip({ events }: { events: CalendarEvent[] }) {
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function WorkingCalendar({
  legend,
  disableDate,
  disabledDates = [],
  multiSelect = false,
  onMultiSelect,
  onAddClick,
  events: eventsProp = [],
  maxVisibleEvents = DEFAULT_MAX_VISIBLE,
  renderEvent,
  renderTooltip,
  onOverflowClick,
  hideLegend = false,
}: WorkingCalendarProps = {}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [showMini, setShowMini] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const monthBtnRef = useRef<HTMLButtonElement>(null);

  // Validate events at runtime
  const validatedEvents = useMemo(() => {
    const { valid, invalid } = validateEvents(eventsProp as unknown[]);
    if (invalid.length > 0 && import.meta.env.MODE !== "production") {
      console.warn(
        `[WorkingCalendar] ${invalid.length} event(s) failed validation and were skipped:`,
        invalid,
      );
    }
    return valid;
  }, [eventsProp]);

  // Group events by date key, sorted by priority desc
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of validatedEvents) {
      const key = normalizeToDateKey(ev.date);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    for (const [key, bucket] of map) {
      map.set(
        key,
        [...bucket].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),
      );
    }
    return map;
  }, [validatedEvents]);

  const disabledSet = useMemo<Set<string>>(() => {
    const all: Array<string | Date | number> = [...disabledDates];
    if (disableDate !== undefined) all.push(disableDate);
    return new Set(
      all.map(normalizeToDateKey).filter((k): k is string => k !== null),
    );
  }, [disableDate, disabledDates]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const rows: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    rows.push(allDays.slice(i, i + 7));
  }

  const handlePrev = () => setViewDate((d) => addMonths(d, -1));
  const handleNext = () => setViewDate((d) => addMonths(d, 1));
  const handleToday = () =>
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  const handleMiniSelect = (month: number, year: number) =>
    setViewDate(new Date(year, month, 1));
  const isOutside = (d: Date) => d < monthStart || d > monthEnd;

  const toggleDaySelection = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    if (disabledSet.has(key)) return;
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleHeaderAdd = () => {
    const sorted = Array.from(selectedDates)
      .filter((k) => !disabledSet.has(k))
      .sort();
    onMultiSelect?.(sorted);
  };

  const clearSelection = () => setSelectedDates(new Set());

  const showLegend = !hideLegend && validatedEvents.length > 0;

  return (
    <div className="wc-wrapper">
      {/* Header */}
      <div className="wc-header-bar">
        <span className="wc-title">{legend ?? ""}</span>

        <div className="wc-nav">
          <button
            className="wc-nav-btn"
            onClick={handlePrev}
            aria-label="Previous month"
          >
            ‹
          </button>

          <div style={{ position: "relative" }}>
            <button
              ref={monthBtnRef}
              className={`wc-month-btn${showMini ? " active" : ""}`}
              onClick={() => setShowMini((v) => !v)}
              aria-expanded={showMini}
            >
              {format(viewDate, "MMMM yyyy")}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path
                  d="M1 1l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {showMini && (
              <MiniCalendar
                currentMonth={viewDate.getMonth()}
                currentYear={viewDate.getFullYear()}
                onSelect={handleMiniSelect}
                onClose={() => setShowMini(false)}
                anchorRef={monthBtnRef}
              />
            )}
          </div>

          <button
            className="wc-nav-btn"
            onClick={handleNext}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="wc-header-actions">
          <button className="wc-today-btn" onClick={handleToday}>
            Today
          </button>

          {multiSelect && (
            <>
              {selectedDates.size > 0 && (
                <button className="wc-clear-btn" onClick={clearSelection}>
                  Clear ({selectedDates.size})
                </button>
              )}
              <button
                className="wc-header-add-btn"
                disabled={selectedDates.size === 0}
                onClick={handleHeaderAdd}
              >
                <span className="wc-header-add-icon">+</span>
                Add
                {selectedDates.size > 0 && (
                  <span className="wc-add-badge">{selectedDates.size}</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="wc-calendar">
        <div className="wc-day-headers">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`wc-day-header${i === 0 || i === 6 ? " weekend" : ""}`}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="wc-grid">
          {rows.map((row, rowIdx) =>
            row.map((day) => {
              const outside = isOutside(day);
              const weekend = isWeekend(day);
              const todayCell = isToday(day);
              const isLastRow = rowIdx === rows.length - 1;
              const weekNum = getWeek(day);
              const dayOfWeek = getDay(day);
              const showWeek = dayOfWeek === 0;
              const dayKey = format(day, "yyyy-MM-dd");
              const isDisabled = !outside && disabledSet.has(dayKey);
              const isSelected = multiSelect && selectedDates.has(dayKey);
              const cellEvents = outside
                ? []
                : (eventsByDate.get(dayKey) ?? []);
              const visibleEvents = cellEvents.slice(0, maxVisibleEvents);
              const hiddenEvents = cellEvents.slice(maxVisibleEvents);

              return (
                <div
                  key={day.toISOString()}
                  className={[
                    "wc-cell",
                    outside ? "outside" : "",
                    weekend && !outside ? "weekend-cell" : "",
                    todayCell ? "today" : "",
                    isLastRow ? "last-row" : "",
                    isDisabled ? "disabled" : "",
                    multiSelect && !outside && !isDisabled ? "selectable" : "",
                    isSelected ? "selected" : "",
                    cellEvents.length > 0 ? "has-events" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    if (multiSelect && !outside && !isDisabled)
                      toggleDaySelection(day);
                  }}
                >
                  {/* Day number + add button row */}
                  <div className="wc-cell-top">
                    <span className="wc-day-num">{format(day, "d")}</span>

                    {!multiSelect && !outside && !isDisabled && onAddClick && (
                      <button
                        className="wc-add-btn"
                        aria-label={`Add event on ${format(day, "PPP")}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddClick(dayKey);
                        }}
                      >
                        +
                      </button>
                    )}

                    {isSelected && (
                      <span className="wc-check-tick" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Event track pills */}
                  {visibleEvents.length > 0 && (
                    <div className="wc-events">
                      {visibleEvents.map((ev, trackIndex) => (
                        <EventPill
                          key={ev.id}
                          event={ev}
                          trackIndex={trackIndex}
                          dateKey={dayKey}
                          renderEvent={renderEvent}
                          renderTooltip={renderTooltip}
                        />
                      ))}
                    </div>
                  )}

                  {/* Overflow chip */}
                  {hiddenEvents.length > 0 && (
                    <button
                      className="wc-overflow-chip"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOverflowClick?.(dayKey, hiddenEvents);
                      }}
                      aria-label={`${hiddenEvents.length} more events`}
                    >
                      +{hiddenEvents.length} more
                    </button>
                  )}

                  {isDisabled && (
                    <span className="wc-disabled-line" aria-hidden="true" />
                  )}

                  {showWeek && !outside && (
                    <span className="wc-week-badge">W{weekNum}</span>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* Dynamic event legend */}
      {showLegend && <LegendStrip events={validatedEvents} />}
    </div>
  );
}
