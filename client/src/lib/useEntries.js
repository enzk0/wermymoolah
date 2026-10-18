import { useEffect, useState } from 'react';
import { ApiError, api } from './api.js';
import { monthGrid } from './day.js';
import { totalCents } from './money.js';

function sortEntries(entries) {
  return entries.sort((a, b) => {
    if (a.entryDate !== b.entryDate) return a.entryDate < b.entryDate ? -1 : 1;
    return a.id - b.id;
  });
}

function messageFor(err) {
  return err instanceof ApiError ? err.message : 'Something went wrong.';
}

export function useEntries(month) {
  const [entries, setEntries] = useState([]);
  const [loadedFrom, setLoadedFrom] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const grid = monthGrid(month);
  const from = grid[0];
  const to = grid[grid.length - 1];

  const loading = loadedFrom !== from;

  useEffect(() => {
    const controller = new AbortController();

    api
      .listEntries(from, to, controller.signal)
      .then((rows) => {
        setEntries(rows);
        setError(null);
        setLoadedFrom(from);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(messageFor(err));
        setLoadedFrom(from);
      });

    return () => controller.abort();
  }, [from, to]);

  async function run(operation) {
    setBusy(true);
    setError(null);
    try {
      await operation();
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(false);
    }
  }

  function createEntry(day, draft) {
    return run(async () => {
      const created = await api.createEntry({ entryDate: day, ...draft });
      setEntries((prev) => sortEntries([...prev, created]));
    });
  }

  function updateEntry(id, draft) {
    return run(async () => {
      const updated = await api.updateEntry(id, draft);
      setEntries((prev) => prev.map((entry) => (entry.id === id ? updated : entry)));
    });
  }

  function deleteEntry(id) {
    return run(async () => {
      await api.deleteEntry(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    });
  }

  const entriesByDay = Object.groupBy(entries, (entry) => entry.entryDate);

  const monthPrefix = `${month.year}-${String(month.month).padStart(2, '0')}`;
  const monthTotal = totalCents(
    entries.filter((entry) => entry.entryDate.startsWith(monthPrefix)),
  );

  return {
    entriesByDay,
    monthTotal,
    loading,
    busy,
    error,
    dismissError: () => setError(null),
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
