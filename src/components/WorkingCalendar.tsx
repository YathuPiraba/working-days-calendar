import { useRef, useState } from "react";
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWorkingDays(days: Date[]): number {
  return days.filter((d) => !isWeekend(d)).length;
}

interface WorkingCalendarProps {
  legend?: string;
  multiSelect?: boolean;
  onAddClick?: (date: string) => void;
  onMultiSelect?: (dates: string[]) => void;
}

export default function WorkingCalendar({
  legend,
  multiSelect = false,
  onAddClick,
  onMultiSelect,
}: WorkingCalendarProps = {}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [showMini, setShowMini] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const monthBtnRef = useRef<HTMLButtonElement>(null);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const totalDays = monthDays.length;
  const workingDays = getWorkingDays(monthDays);
  const weekendDays = totalDays - workingDays;

  const rows: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    rows.push(allDays.slice(i, i + 7));
  }

  const handlePrev = () => setViewDate((d) => addMonths(d, -1));
  const handleNext = () => setViewDate((d) => addMonths(d, 1));
  const handleToday = () =>
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const handleMiniSelect = (month: number, year: number) => {
    setViewDate(new Date(year, month, 1));
  };

  const isOutside = (d: Date) => d < monthStart || d > monthEnd;

  const toggleDaySelection = (day: Date) => {
    const key = format(day, "yyyy-MM-dd");
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleHeaderAdd = () => {
    // Returns plain 'yyyy-MM-dd' strings — no timezone ambiguity
    const sorted = Array.from(selectedDates).sort();
    onMultiSelect?.(sorted);
  };

  const clearSelection = () => setSelectedDates(new Set());

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

        {/* Right side actions */}
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
              const isSelected = multiSelect && selectedDates.has(dayKey);

              return (
                <div
                  key={day.toISOString()}
                  className={[
                    "wc-cell",
                    outside ? "outside" : "",
                    weekend && !outside ? "weekend-cell" : "",
                    todayCell ? "today" : "",
                    isLastRow ? "last-row" : "",
                    multiSelect && !outside ? "selectable" : "",
                    isSelected ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    if (multiSelect && !outside) toggleDaySelection(day);
                  }}
                >
                  <span className="wc-day-num">{format(day, "d")}</span>

                  {/* + button: only in single-select mode — explicitly blocked when multiSelect=true */}
                  {!multiSelect && !outside && (
                    <button
                      className="wc-add-btn"
                      aria-label={`Add event on ${format(day, "PPP")}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Guard: never fires if multiSelect is true
                        if (!multiSelect)
                          onAddClick?.(format(day, "yyyy-MM-dd"));
                      }}
                    >
                      +
                    </button>
                  )}

                  {/* Checkmark shown when this day is selected in multi-select mode */}
                  {isSelected && (
                    <span className="wc-check-tick" aria-hidden="true">
                      ✓
                    </span>
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

      {/* Stats strip */}
      <div className="wc-stats">
        <div className="wc-stat">
          <div className="wc-stat-dot accent" />
          <div className="wc-stat-info">
            <span className="wc-stat-value">{workingDays}</span>
            <span className="wc-stat-label">Working days</span>
          </div>
        </div>
        <div className="wc-stat">
          <div className="wc-stat-dot muted" />
          <div className="wc-stat-info">
            <span className="wc-stat-value">{weekendDays}</span>
            <span className="wc-stat-label">Weekend days</span>
          </div>
        </div>
        <div className="wc-stat">
          <div className="wc-stat-dot success" />
          <div className="wc-stat-info">
            <span className="wc-stat-value">{totalDays}</span>
            <span className="wc-stat-label">Total days</span>
          </div>
        </div>
        <div className="wc-stat">
          <div className="wc-stat-dot accent" />
          <div className="wc-stat-info">
            <span className="wc-stat-value">{workingDays * 8}</span>
            <span className="wc-stat-label">Work hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
