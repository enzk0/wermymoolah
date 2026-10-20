const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(BASE_URL + path, {
      ...options,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;

    throw new ApiError('Cannot reach the server. Is the API running?', 0);
  }

  if (response.status === 204) return null;

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error ?? `Request failed (${response.status})`, response.status);
  }

  return response.json();
}

export const api = {
  listEntries(from, to, signal) {
    const params = new URLSearchParams({ from, to });
    return request(`/entries?${params}`, { signal });
  },

  createEntry(entry) {
    return request('/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  updateEntry(id, changes) {
    return request(`/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  },

  deleteEntry(id) {
    return request(`/entries/${id}`, { method: 'DELETE' });
  },

  listCategories() {
    return request('/categories');
  },

  createCategory(name) {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  deleteCategory(id) {
    return request(`/categories/${id}`, { method: 'DELETE' });
  },
};
