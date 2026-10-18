import { useEffect, useRef, useState } from 'react';
import { Button } from './Button.jsx';
import { inputClasses, labelClasses } from './formStyles.js';

export function NewCategoryDialog({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const dialog = useRef(null);

  useEffect(() => {
    dialog.current.showModal();
  }, []);

  async function handleSave(event) {
    event.preventDefault();

    const trimmed = name.trim();
    if (trimmed === '') return;

    setSaving(true);
    try {
      await onSave(trimmed);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-full max-w-sm rounded-xl border border-rule bg-surface p-5 text-ink shadow-card backdrop:bg-paper/70 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClasses}>New category</span>
          <input
            type="text"
            autoFocus
            maxLength={50}
            placeholder="e.g. Pets"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            className={inputClasses}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
