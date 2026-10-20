import { useState } from 'react';
import { inputClasses } from './formStyles.js';

const rowClasses = 'w-full cursor-pointer px-2.5 py-1.5 text-left text-sm hover:bg-surface-hover';

export function CategoryPicker({
  categories,
  value,
  disabled,
  onChange,
  onRequestNew,
  onRequestDelete,
}) {
  const [open, setOpen] = useState(false);

  function choose(action) {
    action();
    setOpen(false);
  }

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          event.stopPropagation();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        aria-expanded={open}
        aria-label={`Category: ${value || 'none'}`}
        className={`${inputClasses} flex cursor-pointer items-center justify-between text-left`}
      >
        <span>{value || '—'}</span>
        <span aria-hidden="true" className="text-ink-faint">
          ▾
        </span>
      </button>

      {open && (
        <ul className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-rule-strong bg-paper py-1">
          <li>
            <button type="button" className={rowClasses} onClick={() => choose(() => onChange(''))}>
              —
            </button>
          </li>

          {categories.map((c) => (
            <li key={c.id} className="group flex items-center">
              <button
                type="button"
                className={rowClasses}
                onClick={() => choose(() => onChange(c.name))}
              >
                {c.name}
              </button>
              <button
                type="button"
                aria-label={`Delete category ${c.name}`}
                onClick={() => choose(() => onRequestDelete(c))}
                className="mr-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded text-ink-faint opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 hover:bg-danger-wash hover:text-danger focus:opacity-100"
              >
                ×
              </button>
            </li>
          ))}

          <li className="mt-1 border-t border-rule pt-1">
            <button type="button" className={rowClasses} onClick={() => choose(onRequestNew)}>
              + Create new category
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
