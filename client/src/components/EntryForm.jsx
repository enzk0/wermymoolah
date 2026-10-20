import { useEffect, useRef, useState } from 'react';
import { Button } from './Button.jsx';
import { CategoryPicker } from './CategoryPicker.jsx';
import { DeleteCategoryDialog } from './DeleteCategoryDialog.jsx';
import { NewCategoryDialog } from './NewCategoryDialog.jsx';
import { inputClasses, labelClasses } from './formStyles.js';
import { centsToInput, parseAmountToCents } from '../lib/money.js';

export function EntryForm({
  entry,
  categories,
  onCreateCategory,
  onDeleteCategory,
  submitLabel,
  busy,
  onSubmit,
  onCancel,
  autoFocus = false,
}) {
  const [amount, setAmount] = useState(entry ? centsToInput(entry.amountCents) : '');
  const [note, setNote] = useState(entry?.note ?? '');
  const [category, setCategory] = useState(entry?.category ?? '');
  const [error, setError] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);

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

  async function saveNewCategory(name) {
    const created = await onCreateCategory(name);
    setCategory(created.name);
    setAddingCategory(false);
  }

  async function confirmDeleteCategory() {
    const { id, name } = deletingCategory;
    await onDeleteCategory(id);
    if (name === category) setCategory('');
    setDeletingCategory(null);
  }

  return (
    <>
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

          <div className="flex flex-col gap-1">
            <span className={labelClasses}>Category</span>
            <CategoryPicker
              categories={categories}
              value={category}
              disabled={busy}
              onChange={setCategory}
              onRequestNew={() => setAddingCategory(true)}
              onRequestDelete={setDeletingCategory}
            />
          </div>
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

      {addingCategory && (
        <NewCategoryDialog onSave={saveNewCategory} onCancel={() => setAddingCategory(false)} />
      )}

      {deletingCategory && (
        <DeleteCategoryDialog
          category={deletingCategory}
          onConfirm={confirmDeleteCategory}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </>
  );
}
