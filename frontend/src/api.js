const API_BASE = '/api';

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories/`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchProducts({ category = '', search = '', sort = '', featured = '' } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  if (sort) params.append('sort', sort);
  if (featured) params.append('featured', featured);

  const res = await fetch(`${API_BASE}/products/?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductBySlug(slug) {
  const res = await fetch(`${API_BASE}/products/${slug}/`);
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json();
}

export async function fetchFeaturedOverview() {
  const res = await fetch(`${API_BASE}/featured-overview/`);
  if (!res.ok) throw new Error('Failed to fetch overview data');
  return res.json();
}

export async function createOrder(orderPayload) {
  const res = await fetch(`${API_BASE}/orders/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to place order. Please check required fields.');
  }
  return res.json();
}

export async function fetchOrderByNumber(orderNumber) {
  const res = await fetch(`${API_BASE}/orders/${orderNumber}/`);
  if (!res.ok) throw new Error('Order not found. Please verify the order reference.');
  return res.json();
}

