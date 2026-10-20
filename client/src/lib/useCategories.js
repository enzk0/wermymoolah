import { useEffect, useState } from 'react';
import { ApiError, api } from './api.js';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listCategories()
      .then((rows) => {
        setCategories(rows);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      });
  }, []);

  async function createCategory(name) {
    const created = await api.createCategory(name);
    setCategories((prev) => [...prev, created]);
    return created;
  }

  async function deleteCategory(id) {
    await api.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return {
    categories,
    error,
    createCategory,
    deleteCategory,
  };
}
