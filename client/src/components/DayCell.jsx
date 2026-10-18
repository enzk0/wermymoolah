import clsx from 'clsx';
import { formatCentsShort, totalCents } from '../lib/money.js';
import { parseKey } from '../lib/day.js';

export function DayCell({ day, entries, inMonth, isToday, isSelected, onSelect }) {
  const total = totalCents(entries);
  const noteOnlyCount = entries.filter((entry) => entry.amountCents === 0).length;
  const dayNumber = parseKey(day).day;

  const label =
    total > 0
      ? `${day}, ${formatCentsShort(total)} across ${entries.length} entries`
      : `${day}, no spending recorded`;

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      aria-pressed={isSelected}
      aria-label={label}
      className={clsx(
        'relative flex min-h-18 cursor-pointer flex-col items-start gap-1 p-1.5 text-left transition-colors sm:min-h-25 sm:px-2 sm:py-2',
        'focus-visible:inset-ring-2 focus-visible:inset-ring-accent focus-visible:outline-none',
        isSelected && 'bg-accent-wash inset-ring-2 inset-ring-accent',
        !isSelected && inMonth && 'bg-surface hover:bg-surface-hover',
        !isSelected && !inMonth && 'bg-surface-sunk hover:bg-surface-hover',
      )}
    >
      <span
        className={clsx(
          'font-mono text-sm tabular-nums',
          isToday && '-m-0.5 grid size-6 place-items-center rounded-full bg-today font-bold text-white',
          !isToday && inMonth && 'text-ink-soft',
          !isToday && !inMonth && 'text-ink-faint',
        )}
      >
        {dayNumber}
      </span>

      {total > 0 && (
        <span className="font-mono text-xs leading-tight font-semibold wrap-anywhere text-accent tabular-nums sm:text-sm">
          {formatCentsShort(total)}
        </span>
      )}

      {noteOnlyCount > 0 && (
        <span className="size-1.5 rounded-full bg-ink-faint" title={`${noteOnlyCount} note(s)`} />
      )}

      {entries.length > 1 && (
        <span
          className={clsx(
            'absolute top-2 right-2 hidden min-w-4.5 rounded-full px-1 text-center font-mono text-[0.68rem] leading-4.5 sm:block',
            isSelected ? 'bg-accent text-accent-ink' : 'bg-surface-sunk text-ink-soft',
          )}
        >
          {entries.length}
        </span>
      )}
    </button>
  );
}
