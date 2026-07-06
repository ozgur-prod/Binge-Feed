const BASE_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    ...rest,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

// Token lives in localStorage ("Remember me" at login) or sessionStorage otherwise.
function authHeaders() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const authAPI = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  sendResetCode: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  verifyResetCode: (body) => request('/auth/verify-reset-code', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
};

export const usersAPI = {
  getMe: () => request('/users/me', { headers: authHeaders() }),
  updateMe: (body) => request('/users/me', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }),
};

export const showsAPI = {
  getPopular: () => request('/shows/popular'),
  getTrending: () => request('/shows/trending'),
  search: (query) => request(`/shows/search?q=${encodeURIComponent(query)}`),
  getDetails: (id) => request(`/shows/${id}`),
  getSeason: (id, season) => request(`/shows/${id}/season/${season}`),
  getWatchProviders: (id) => request(`/shows/${id}/watch-providers`),
};
