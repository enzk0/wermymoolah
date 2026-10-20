import { useEffect, useRef, useState } from 'react';
import { Button } from './Button.jsx';

export function DeleteCategoryDialog({ category, onConfirm, onCancel }) {
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const dialog = useRef(null);

  useEffect(() => {
    dialog.current.showModal();
  }, []);

  async function handleContinue() {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
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
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold">Delete category?</h2>
          <p className="mt-1 text-sm text-ink-soft">
            “{category.name}” will be removed from the list. Entries that already use it keep
            their label.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleContinue} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Continue'}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
