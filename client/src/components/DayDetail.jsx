import { useState } from 'react';
import { Button } from './Button.jsx';
import { EntryForm } from './EntryForm.jsx';
import { formatCents, totalCents } from '../lib/money.js';
import { longDayLabel, todayKey } from '../lib/day.js';

const card = 'overflow-hidden rounded-xl border border-rule bg-surface shadow-card';
const pill = 'rounded-full px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide uppercase';

export function DayDetail({
  day,
  entries,
  categories,
  onCreateCategory,
  busy,
  onCreate,
  onUpdate,
  onDelete,
  onClose,
}) {
  const [editingId, setEditingId] = useState(null);

  if (!day) {
    return (
      <aside className={`${card} p-6`}>
        <p className="text-sm/relaxed text-ink-faint">
          Pick a day on the calendar to see what you spent and add an entry.
        </p>
      </aside>
    );
  }

  const total = totalCents(entries);

  return (
    <aside aria-label={`Entries for ${day}`} className={`${card} flex flex-col lg:sticky lg:top-4`}>
      <header className="flex items-start justify-between gap-2 border-b border-rule bg-linear-to-b from-surface-sunk to-surface px-4 py-4">
        <div>
          <h2 className="font-semibold">{longDayLabel(day)}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
            {entries.length === 0 ? (
              'Nothing recorded yet'
            ) : (
              <>
                <strong className="font-mono text-accent">{formatCents(total)}</strong>·{' '}
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </>
            )}
            {day === todayKey() && (
              <span className={`${pill} bg-today-wash text-today`}>Today</span>
            )}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close day details">
          ×
        </Button>
      </header>

      <ul className="max-h-88 overflow-y-auto">
        {entries.map((entry) =>
          entry.id === editingId ? (
            <li key={entry.id} className="border-b border-rule bg-surface-sunk px-4 py-3">
              <EntryForm
                entry={entry}
                categories={categories}
                onCreateCategory={onCreateCategory}
                submitLabel="Save changes"
                busy={busy}
                autoFocus
                onSubmit={async (draft) => {
                  await onUpdate(entry.id, draft);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <li key={entry.id} className="group border-b border-rule px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-semibold tabular-nums">
                  {entry.amountCents > 0 ? formatCents(entry.amountCents) : 'Note'}
                </span>
                {entry.category && (
                  <span className={`${pill} bg-surface-sunk text-ink-soft`}>{entry.category}</span>
                )}
              </div>

              {entry.note && (
                <p className="mt-1 text-sm/snug wrap-anywhere whitespace-pre-wrap text-ink-soft">
                  {entry.note}
                </p>
              )}

              <div className="mt-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => setEditingId(entry.id)}
                  disabled={busy}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => onDelete(entry.id)}
                  disabled={busy}
                >
                  Delete
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>

      <div className="px-4 pt-4 pb-5">
        <h3 className="mb-2.5 text-[0.7rem] font-semibold tracking-widest text-ink-faint uppercase">
          Add an entry
        </h3>
        <EntryForm
          categories={categories}
          onCreateCategory={onCreateCategory}
          submitLabel="Add"
          busy={busy}
          onSubmit={(draft) => onCreate(day, draft)}
        />
      </div>
    </aside>
  );
}
