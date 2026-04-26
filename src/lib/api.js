const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let _accessToken = null;
let _refreshPromise = null;

export const setAccessToken = (t) => { _accessToken = t; };
export const clearAccessToken = () => { _accessToken = null; };

const AUTH_EXPIRED_EVENT = 'luxe:auth-expired';
const SERVER_UNREACHABLE = 'Server unreachable. Please try again.';

export const onAuthExpired = (handler) => {
  window.addEventListener(AUTH_EXPIRED_EVENT, handler);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handler);
};

const toNetworkError = (err) => {
  if (err instanceof TypeError) return new Error(SERVER_UNREACHABLE);
  return err;
};

const parseJson = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    if (!res.ok) throw new Error('Request failed');
    return null;
  }
};

const refreshAccessToken = () => {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .catch((err) => { throw toNetworkError(err); })
    .then(async (res) => {
      if (!res.ok) throw new Error('Refresh failed');
      return parseJson(res);
    })
    .then(({ token }) => { _accessToken = token; })
    .catch((err) => {
      _accessToken = null;
      if (err.message === SERVER_UNREACHABLE) throw err;
      try { window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT)); } catch {}
    })
    .finally(() => { _refreshPromise = null; });
  return _refreshPromise;
};

export const bootstrapSession = async () => {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    return parseJson(res);
  } catch (err) {
    throw toNetworkError(err);
  }
};

const request = async (path, options = {}, retry = true) => {
  const hasBody = options.body !== undefined;
  let res;

  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(hasBody && { 'Content-Type': 'application/json' }),
        ...(_accessToken && { Authorization: `Bearer ${_accessToken}` }),
        ...options.headers,
      },
    });
  } catch (err) {
    throw toNetworkError(err);
  }

  if (res.status === 401 && retry && path !== '/auth/refresh') {
    await refreshAccessToken();
    if (_accessToken) return request(path, options, false);
  }

  const data = await parseJson(res);
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
};

export const api = {
  get:    (path, opts = {}) => request(path, { ...opts, method: 'GET' }),
  post:   (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put:    (path, body, opts = {}) => request(path, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  patch:  (path, body, opts = {}) => request(path, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path, opts = {}) => request(path, { ...opts, method: 'DELETE' }),
};
