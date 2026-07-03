const BASE_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

export const authAPI = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  sendResetCode: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  verifyResetCode: (body) => request('/auth/verify-reset-code', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
};

export const showsAPI = {
  getPopular: () => request('/shows/popular'),
  getTrending: () => request('/shows/trending'),
  search: (query) => request(`/shows/search?q=${encodeURIComponent(query)}`),
  discover: ({ genres, platforms, yearFrom, yearTo, minRating } = {}) => {
    const params = new URLSearchParams();
    if (genres?.length) params.set('genres', genres.join(','));
    if (platforms?.length) params.set('platforms', platforms.join(','));
    if (yearFrom) params.set('yearFrom', yearFrom);
    if (yearTo) params.set('yearTo', yearTo);
    if (minRating) params.set('minRating', minRating);
    return request(`/shows/discover?${params.toString()}`);
  },
};
