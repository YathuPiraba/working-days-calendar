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

export default function WorkingCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [showMini, setShowMini] = useState(false);
  const monthBtnRef = useRef<HTMLButtonElement>(null);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Split into rows to detect last row for border removal
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

  return (
    <div className="wc-wrapper">
      {/* Header */}
      <div className="wc-header-bar">
        <span className="wc-title">Working Calendar</span>

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

        <button className="wc-today-btn" onClick={handleToday}>
          Today
        </button>
      </div>

      {/* Calendar grid */}
      <div className="wc-calendar">
        {/* Day headers */}
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

        {/* Day cells */}
        <div className="wc-grid">
          {rows.map((row, rowIdx) =>
            row.map((day) => {
              const outside = isOutside(day);
              const weekend = isWeekend(day);
              const todayCell = isToday(day);
              const isLastRow = rowIdx === rows.length - 1;
              const weekNum = getWeek(day);
              const dayOfWeek = getDay(day);
              const showWeek = dayOfWeek === 0; // show week number on Sundays

              return (
                <div
                  key={day.toISOString()}
                  className={[
                    "wc-cell",
                    outside ? "outside" : "",
                    weekend && !outside ? "weekend-cell" : "",
                    todayCell ? "today" : "",
                    isLastRow ? "last-row" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="wc-day-num">{format(day, "d")}</span>
                  {showWeek && !outside && (
                    <span className="wc-week-badge">W{weekNum}</span>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
