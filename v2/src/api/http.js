import { ApiError } from './errors.js';
import { mockHandler } from './mock.js';

const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

const TOKEN_KEY = 'indsupply_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/**
 * Single entry point for every API call.
 * Real backend: JSON over fetch with `Authorization: Bearer <token>`.
 * Expected error body: { "message": "Human readable", "errors": { "field": "msg" } }
 */
async function request(method, path, { params, body } = {}) {
  const token = tokenStore.get();
  if (USE_MOCK) return mockHandler(method, path, { params: params || {}, body: body || {}, token });

  const clean = Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '');
  const qs = clean.length ? `?${new URLSearchParams(clean)}` : '';
  let res;
  try {
    res = await fetch(`${BASE}${path}${qs}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.errors || null);
  }
  return data;
}

export const http = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
};
