// Frontend API client for the FastAPI backend (api/).
// Base URL comes from VITE_API_URL. If it is not set, or the
// backend is not running, every call here fails soft and the
// caller falls back to its hardcoded sample/mock data — so the
// site never breaks because the backend is down. To use the
// backend locally: run the API on :8000, then set
// VITE_API_URL=http://localhost:8000 in motion-studio/.env
// and restart `npm run dev`.
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '';

export type ApiProduct = {
  id: number; name: string; material: string; category: string;
  badge: string; image_url: string;
};

export type ApiFeedback = {
  id: number; name: string; role: string; sector: string;
  quote: string; rating: number; approved: boolean;
};

async function getJson<T>(path: string): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function fetchProducts(): Promise<ApiProduct[] | null> {
  return getJson<ApiProduct[]>('/api/products');
}

export function fetchFeedback(): Promise<ApiFeedback[] | null> {
  return getJson<ApiFeedback[]>('/api/feedback');
}

export function apiBase(): string {
  return API_BASE;
}

// Public review submission. Returns true only on a 201 from
// the API — the review starts UNAPPROVED, so a successful
// submit does NOT mean it is live yet. Callers must say so.
// Returns false (never throws) when the backend is not set up
// or not running, so the form can show an honest error instead
// of pretending the review was saved.
export async function submitFeedback(data: {
  name: string; role: string; sector: string; quote: string; rating: number;
}): Promise<boolean> {
  if (!API_BASE) return false;
  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.status === 201;
  } catch {
    return false;
  }
}

// --- Admin helpers -------------------------------------------------
// Admin calls are different from public calls on purpose: they
// must NOT fail soft. If the key is wrong, the backend says 401
// and the admin page must show "wrong key", not silently show
// sample data. So these throw an Error with the HTTP status,
// and the admin page turns that into a message. The backend
// still enforces the key on every request — this frontend key
// is convenience only, never security on its own.
export type ApiEnquiry = {
  id: number; name: string; contact: string; product_name: string;
  message: string; source: string; created_at: string | null;
};

export type ProductInput = {
  name: string; material: string; category: string; badge: string; image_url: string;
};

async function adminFetch<T>(path: string, key: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error('Backend not configured: set VITE_API_URL and rebuild.');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': key, ...(init?.headers || {}) },
  });
  if (res.status === 401) throw new Error('Wrong admin key.');
  if (res.status === 503) throw new Error('Admin key is not set on the backend (set ADMIN_KEY).');
  if (res.status === 429) throw new Error('Too many attempts — wait a minute and try again.');
  if (!res.ok) throw new Error(`Request failed (${res.status}).`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function checkAdminKey(key: string): Promise<ApiEnquiry[]> {
  return adminFetch<ApiEnquiry[]>('/api/enquiries', key);
}

export function fetchAllFeedback(key: string): Promise<ApiFeedback[]> {
  return adminFetch<ApiFeedback[]>('/api/feedback?include_unapproved=true', key);
}

export function approveFeedback(id: number, key: string): Promise<ApiFeedback> {
  return adminFetch<ApiFeedback>(`/api/feedback/${id}/approve`, key, { method: 'POST' });
}

export function deleteFeedback(id: number, key: string): Promise<void> {
  return adminFetch<void>(`/api/feedback/${id}`, key, { method: 'DELETE' });
}

export function createProduct(data: ProductInput, key: string): Promise<ApiProduct> {
  return adminFetch<ApiProduct>('/api/products', key, { method: 'POST', body: JSON.stringify(data) });
}

export function updateProduct(id: number, data: ProductInput, key: string): Promise<ApiProduct> {
  return adminFetch<ApiProduct>(`/api/products/${id}`, key, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteProduct(id: number, key: string): Promise<void> {
  return adminFetch<void>(`/api/products/${id}`, key, { method: 'DELETE' });
}

export function fetchEnquiries(key: string): Promise<ApiEnquiry[]> {
  return adminFetch<ApiEnquiry[]>('/api/enquiries', key);
}
