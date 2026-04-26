const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let _accessToken = null;
let _refreshPromise = null;

export const setAccessToken   = (t) => { _accessToken = t; };
export const clearAccessToken = ()  => { _accessToken = null; };

// Notify listeners when the session is unrecoverably gone (refresh failed).
// Consumers (App.jsx, store) listen and clear local user state + redirect.
const AUTH_EXPIRED_EVENT = 'luxe:auth-expired';
export const onAuthExpired = (handler) => {
  window.addEventListener(AUTH_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
};

const refreshAccessToken = () => {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then(({ token }) => { _accessToken = token; })
    .catch(() => {
      _accessToken = null;
      // Fire-and-forget — App.jsx listens and clears user state + navigates to login.
      try { window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT)); } catch {}
    })
    .finally(() => { _refreshPromise = null; });
  return _refreshPromise;
};

const request = async (path, options = {}, retry = true) => {
  const hasBody = options.body !== undefined;
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(hasBody && { 'Content-Type': 'application/json' }),
      ...(_accessToken && { Authorization: `Bearer ${_accessToken}` }),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    await refreshAccessToken();
    if (_accessToken) return request(path, options, false);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  get:    (path,         opts = {}) => request(path, { ...opts, method: 'GET' }),
  post:   (path, body,   opts = {}) => request(path, { ...opts, method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body,   opts = {}) => request(path, { ...opts, method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body,   opts = {}) => request(path, { ...opts, method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path,         opts = {}) => request(path, { ...opts, method: 'DELETE' }),
};

export const normalizeProduct = (p) => ({
  id:            p.id,
  name:          p.name,
  slug:          p.slug,
  brand:         p.brands?.name || '',
  category:      p.categories?.slug || '',
  description:   p.description || '',
  price:         Number(p.price),
  originalPrice: p.original_price ? Number(p.original_price) : null,
  rating:        Number(p.rating) || 0,
  reviews:       p.reviews_count || 0,
  inStock:       p.in_stock,
  image:         p.product_images?.find(i => i.is_primary)?.image_url
                 || p.product_images?.[0]?.image_url
                 || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600',
  images:        p.product_images || [],
  tags:          p.product_tags?.map(t => t.tag) || [],
  sizes:         [...new Set((p.product_variants || []).map(v => v.size))].filter(Boolean).length
                 ? [...new Set((p.product_variants || []).map(v => v.size))]
                 : ['One Size'],
  colors:        [...new Set((p.product_variants || []).map(v => v.color))].filter(Boolean).length
                 ? [...new Set((p.product_variants || []).map(v => v.color))]
                 : ['#1a1a1a'],
  variants:      p.product_variants || [],
});
