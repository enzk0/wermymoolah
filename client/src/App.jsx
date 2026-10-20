import { useEffect, useState } from 'react';
import { Button } from './components/Button.jsx';
import { DayDetail } from './components/DayDetail.jsx';
import { MonthCalendar } from './components/MonthCalendar.jsx';
import { addDays, addMonths, isInMonth, monthOf, todayKey } from './lib/day.js';
import { useEntries } from './lib/useEntries.js';
import { useCategories } from './lib/useCategories.js';

const ARROW_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

export function App() {
  const [month, setMonth] = useState(monthOf(todayKey()));
  const [selectedDay, setSelectedDay] = useState(todayKey());

  const { categories, createCategory, deleteCategory } = useCategories();

  const {
    entriesByDay,
    monthTotal,
    loading,
    busy,
    error,
    dismissError,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useEntries(month);

  function selectDay(day) {
    setSelectedDay(day);
    if (!isInMonth(day, month)) setMonth(monthOf(day));
  }

  function goToToday() {
    setSelectedDay(todayKey());
    setMonth(monthOf(todayKey()));
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;

      if (event.key === 'Escape') {
        setSelectedDay(null);
        return;
      }

      const step = ARROW_STEPS[event.key];
      if (step === undefined) return;

      event.preventDefault();
      const nextDay = addDays(selectedDay ?? todayKey(), step);
      setSelectedDay(nextDay);
      if (!isInMonth(nextDay, month)) setMonth(monthOf(nextDay));
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDay, month]);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 pb-12">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tighter">
          wer<span className="text-accent">my</span>moolah
        </h1>
        <p className="mt-1 text-ink-soft">Click a day. Write down what it cost you.</p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-danger bg-danger-wash py-2 pr-2 pl-4 text-sm text-danger"
        >
          <span>{error}</span>
          <Button variant="ghost" size="icon" onClick={dismissError} aria-label="Dismiss">
            ×
          </Button>
        </div>
      )}

      <main className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <MonthCalendar
          month={month}
          entriesByDay={entriesByDay}
          selectedDay={selectedDay}
          monthTotal={monthTotal}
          loading={loading}
          onSelectDay={selectDay}
          onChangeMonth={(amount) => setMonth(addMonths(month, amount))}
          onToday={goToToday}
        />

        <DayDetail
          day={selectedDay}
          entries={entriesByDay[selectedDay] ?? []}
          categories={categories}
          onCreateCategory={createCategory}
          onDeleteCategory={deleteCategory}
          busy={busy}
          onCreate={createEntry}
          onUpdate={updateEntry}
          onDelete={deleteEntry}
          onClose={() => setSelectedDay(null)}
        />
      </main>

      <footer className="mt-6 text-sm text-ink-faint">
        Arrow keys move between days ·{' '}
        <kbd className="rounded border border-rule-strong bg-surface-sunk px-1.5 font-mono text-xs">
          Esc
        </kbd>{' '}
        closes the panel
      </footer>
    </div>
  );
}
