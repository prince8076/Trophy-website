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

// Admin Panel API Methods
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/upload/`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload image file.');
  }
  return res.json();
}

export async function createProduct(productData) {
  const res = await fetch(`${API_BASE}/products/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = typeof err === 'object' ? Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ') : 'Failed to create trophy';
    throw new Error(message || 'Failed to create trophy');
  }
  return res.json();
}

export async function updateProduct(id, productData) {
  const res = await fetch(`${API_BASE}/products/manage/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = typeof err === 'object' ? Object.entries(err).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ') : 'Failed to update trophy';
    throw new Error(message || 'Failed to update trophy');
  }
  return res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/manage/${id}/`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete trophy product.');
  }
  return true;
}

export async function fetchAllOrders() {
  const res = await fetch(`${API_BASE}/orders/`);
  if (!res.ok) throw new Error('Failed to fetch orders.');
  return res.json();
}

export async function updateOrderStatus(orderNumber, status) {
  const res = await fetch(`${API_BASE}/orders/${orderNumber}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update order status');
  }
  return res.json();
}


