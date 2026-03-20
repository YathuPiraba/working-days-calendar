import { useRef, useMemo, useState } from "react";
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
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import "./WorkingCalendar.css";
import MiniCalendar from "./MiniCalendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWorkingDays(days: Date[]): number {
  return days.filter((d) => !isWeekend(d)).length;
}

/**
 * Normalizes any date input the user might pass into a 'yyyy-MM-dd' string.
 * Accepts: 'yyyy-MM-dd' | 'MM/dd/yyyy' | 'dd-MM-yyyy' | Date object | timestamp number.
 * Invalid values are silently dropped so one bad entry never breaks the whole calendar.
 */
function normalizeToDateKey(raw: string | Date | number): string | null {
  try {
    // Already a Date object or timestamp
    if (raw instanceof Date || typeof raw === "number") {
      const d = new Date(raw);
      return isValid(d) ? format(d, "yyyy-MM-dd") : null;
    }
    // ISO string yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const d = parseISO(raw);
      return isValid(d) ? raw : null;
    }
    // MM/dd/yyyy  (US locale format)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      const [mm, dd, yyyy] = raw.split("/");
      const d = new Date(`${yyyy}-${mm}-${dd}`);
      return isValid(d) ? format(d, "yyyy-MM-dd") : null;
    }
    // dd-MM-yyyy  (European locale format)
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split("-");
      const d = new Date(`${yyyy}-${mm}-${dd}`);
      return isValid(d) ? format(d, "yyyy-MM-dd") : null;
    }
    // Fallback: let Date constructor try — handles RFC strings etc.
    const d = new Date(raw);
    return isValid(d) ? format(d, "yyyy-MM-dd") : null;
  } catch {
    return null;
  }
}

interface WorkingCalendarProps {
  legend?: string;
  disableDate?: string | Date | number;
  disabledDates?: Array<string | Date | number>;
  multiSelect?: boolean;
  onAddClick?: (date: string) => void;
  onMultiSelect?: (dates: string[]) => void;
  weekendDays?: number;
  workingDays?: number;
  workHours?: number;
}

export default function WorkingCalendar({
  legend,
  disableDate,
  disabledDates = [],
  multiSelect = false,
  onAddClick,
  onMultiSelect,
  weekendDays: weekendDaysProp,
  workingDays: workingDaysProp,
  workHours: workHoursProp,
}: WorkingCalendarProps = {}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [showMini, setShowMini] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const monthBtnRef = useRef<HTMLButtonElement>(null);

  const disabledSet = useMemo<Set<string>>(() => {
    const all: Array<string | Date | number> = [...disabledDates];
    if (disableDate !== undefined) all.push(disableDate);
    const keys = all
      .map(normalizeToDateKey)
      .filter((k): k is string => k !== null);
    return new Set(keys);
  }, [disableDate, disabledDates]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const totalDays = monthDays.length;
  const computedWorkingDays = getWorkingDays(monthDays);
  const computedWeekendDays = totalDays - computedWorkingDays;

  const statWorkingDays = workingDaysProp ?? computedWorkingDays;
  const statWeekendDays = weekendDaysProp ?? computedWeekendDays;
  const statWorkHours = workHoursProp ?? computedWorkingDays * 8;

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
              const isDisabled = !outside && disabledSet.has(dayKey);
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
                    isDisabled ? "disabled" : "",
                    multiSelect && !outside && !isDisabled ? "selectable" : "",
                    isSelected ? "selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    if (multiSelect && !outside && !isDisabled)
                      toggleDaySelection(day);
                  }}
                >
                  <span className="wc-day-num">{format(day, "d")}</span>
                  {!multiSelect && !outside && !isDisabled && onAddClick && (
                    <button
                      className="wc-add-btn"
                      aria-label={`Add event on ${format(day, "PPP")}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!multiSelect && !isDisabled) onAddClick?.(dayKey);
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

      {/* Stats strip */}
      <div className="wc-stats">
        <div className="wc-stat">
          <div className="wc-stat-dot accent" />
          <div className="wc-stat-info">
            <span className="wc-stat-value">{statWorkingDays}</span>
            <span className="wc-stat-label">Working days</span>
          </div>
        </div>
        <div className="wc-stat">
          <div className="wc-stat-dot muted" />
          <div className="wc-stat-info">
            <span className="wc-stat-value">{statWeekendDays}</span>
            <span className="wc-stat-label">Weekend days</span>
          </div>
        </div>
        <div className="wc-stat">
          <div className="wc-stat-dot success" />
          <div className="wc-stat-info">
            <span className="wc-stat-value">{statWorkHours}</span>
            <span className="wc-stat-label">Work hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
