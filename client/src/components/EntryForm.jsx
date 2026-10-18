import { useEffect, useRef, useState } from 'react';
import { Button } from './Button.jsx';
import { centsToInput, parseAmountToCents } from '../lib/money.js';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Fun', 'Other'];

const inputClasses =
  'w-full rounded-lg border border-rule-strong bg-paper px-2.5 py-2 text-sm text-ink ' +
  'focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent-wash focus-visible:outline-none ' +
  'disabled:opacity-60';
const labelClasses = 'text-xs font-semibold tracking-wide text-ink-faint uppercase';

export function EntryForm({ entry, submitLabel, busy, onSubmit, onCancel, autoFocus = false }) {
  const [amount, setAmount] = useState(entry ? centsToInput(entry.amountCents) : '');
  const [note, setNote] = useState(entry?.note ?? '');
  const [category, setCategory] = useState(entry?.category ?? '');
  const [error, setError] = useState(null);

  const amountInput = useRef(null);

  useEffect(() => {
    if (autoFocus) amountInput.current.focus();
  }, [autoFocus]);

  function handleSubmit(event) {
    event.preventDefault();

    const cents = parseAmountToCents(amount);
    if (cents === null) {
      setError('That amount is not a number.');
      return;
    }
    if (cents === 0 && note.trim() === '') {
      setError('Enter an amount, a note, or both.');
      return;
    }

    setError(null);
    onSubmit({ amountCents: cents, note: note.trim(), category: category || null });

    if (!entry) {
      setAmount('');
      setNote('');
      setCategory('');
      amountInput.current.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Amount</span>
          <input
            ref={amountInput}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={busy}
            className={`${inputClasses} font-mono tabular-nums`}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={labelClasses}>Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={busy}
            className={inputClasses}
          >
            <option value="">—</option>
            {CATEGORIES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className={labelClasses}>Note</span>
        <textarea
          rows={2}
          placeholder="What was it for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={busy}
          className={`${inputClasses} resize-y`}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
