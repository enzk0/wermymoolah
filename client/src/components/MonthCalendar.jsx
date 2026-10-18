import { Button } from './Button.jsx';
import { DayCell } from './DayCell.jsx';
import { formatCents } from '../lib/money.js';
import { WEEKDAY_LABELS, isInMonth, monthGrid, monthLabel, todayKey } from '../lib/day.js';

export function MonthCalendar({
  month,
  entriesByDay,
  selectedDay,
  monthTotal,
  loading,
  onSelectDay,
  onChangeMonth,
  onToday,
}) {
  const days = monthGrid(month);
  const today = todayKey();

  return (
    <section
      aria-label="Spending calendar"
      className="overflow-hidden rounded-xl border border-rule bg-surface shadow-card"
    >
      <header className="flex items-start justify-between gap-4 border-b border-rule bg-linear-to-b from-surface-sunk to-surface px-5 py-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{monthLabel(month)}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {loading ? (
              <span className="text-ink-faint">Loading…</span>
            ) : (
              <>
                <strong className="font-mono font-semibold text-accent">
                  {formatCents(monthTotal)}
                </strong>{' '}
                spent this month
              </>
            )}
          </p>
        </div>

        <nav aria-label="Change month" className="flex flex-none items-center gap-1.5">
          <Button size="icon" onClick={() => onChangeMonth(-1)} aria-label="Previous month">
            ‹
          </Button>
          <Button onClick={onToday}>Today</Button>
          <Button size="icon" onClick={() => onChangeMonth(1)} aria-label="Next month">
            ›
          </Button>
        </nav>
      </header>

      <div aria-hidden="true" className="grid grid-cols-7 border-b border-rule bg-surface-sunk">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="py-2 text-center text-[0.7rem] font-semibold tracking-widest text-ink-faint uppercase"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-rule">
        {days.map((day) => (
          <DayCell
            key={day}
            day={day}
            entries={entriesByDay[day] ?? []}
            inMonth={isInMonth(day, month)}
            isToday={day === today}
            isSelected={day === selectedDay}
            onSelect={onSelectDay}
          />
        ))}
      </div>
    </section>
  );
}
