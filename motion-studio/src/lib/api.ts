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
