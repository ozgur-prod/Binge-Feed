const BASE_URL = 'http://localhost:8080/api';

async function request(path, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    ...rest,
  });
  // an expired or stale token on a protected call: drop the session and send them to login
  if (res.status === 401 && !path.startsWith('/auth/')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    if (window.location.pathname !== '/login') window.location.href = '/login';
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}

// Token lives in localStorage ("Remember me" at login) or sessionStorage otherwise.
function authHeaders() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// clear both storages before saving, so a stale token in the other one can't take precedence
export function saveSession({ token, user }, remember) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('token', token);
  storage.setItem('user', JSON.stringify(user));
}

export const authAPI = {
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  signupRequest: (body) => request('/auth/signup-request', { method: 'POST', body: JSON.stringify(body) }),
  verifySignup: (body) => request('/auth/verify-signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  sendResetCode: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  verifyResetCode: (body) => request('/auth/verify-reset-code', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
};

export const usersAPI = {
  getMe: () => request('/users/me', { headers: authHeaders() }),
  updateMe: (body) => request('/users/me', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }),
  getUser: (id) => request(`/users/${id}`, { headers: authHeaders() }),
  follow: (id) => request(`/users/${id}/follow`, { method: 'POST', headers: authHeaders() }),
  unfollow: (id) => request(`/users/${id}/follow`, { method: 'DELETE', headers: authHeaders() }),
  getFollowers: (id) => request(`/users/${id}/followers`, { headers: authHeaders() }),
  getFollowing: (id) => request(`/users/${id}/following`, { headers: authHeaders() }),
  search: (q) => request(`/users/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() }),
};

export const showsAPI = {
  getPopular: () => request('/shows/popular', { headers: authHeaders() }),
  getTrending: () => request('/shows/trending', { headers: authHeaders() }),
  search: (query) => request(`/shows/search?q=${encodeURIComponent(query)}`, { headers: authHeaders() }),
  getDetails: (id) => request(`/shows/${id}`, { headers: authHeaders() }),
  getSeason: (id, season) => request(`/shows/${id}/season/${season}`, { headers: authHeaders() }),
  getWatchProviders: (id) => request(`/shows/${id}/watch-providers`, { headers: authHeaders() }),
  discover: (filters) => request(`/shows/discover?${new URLSearchParams(filters)}`, { headers: authHeaders() }),
};

export const favoritesAPI = {
  list: (userId) => request(`/users/${userId}/favorites`, { headers: authHeaders() }),
  add: (body) => request('/users/me/favorites', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }),
  remove: (showId) => request(`/users/me/favorites/${showId}`, { method: 'DELETE', headers: authHeaders() }),
};

export const listsAPI = {
  list: (userId) => request(`/users/${userId}/lists`, { headers: authHeaders() }),
  create: (body) => request('/users/me/lists', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }),
  rename: (listId, body) => request(`/users/me/lists/${listId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) }),
  remove: (listId) => request(`/users/me/lists/${listId}`, { method: 'DELETE', headers: authHeaders() }),
  addShow: (listId, body) => request(`/users/me/lists/${listId}/shows`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }),
  removeShow: (listId, showId) => request(`/users/me/lists/${listId}/shows/${showId}`, { method: 'DELETE', headers: authHeaders() }),
};

export const commentsAPI = {
  list: ({ showId, season, episode }) =>
    request(`/comments?${new URLSearchParams({ showId, season, episode })}`, { headers: authHeaders() }),
  create: ({ showId, season, episode, text, parentId }) =>
    request('/comments', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ showId, season, episode, text, parentId }),
    }),
  remove: (id) => request(`/comments/${id}`, { method: 'DELETE', headers: authHeaders() }),
  like: (id) => request(`/comments/${id}/like`, { method: 'POST', headers: authHeaders() }),
  unlike: (id) => request(`/comments/${id}/like`, { method: 'DELETE', headers: authHeaders() }),
};

export const reviewsAPI = {
  create: ({ showId, season, episode, rating, text }) =>
    request('/reviews', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ showId, season, episode, rating, text }),
    }),
  list: ({ showId, season, episode, friends } = {}) => {
    const params = { showId };
    if (season != null) params.season = season;
    if (episode != null) params.episode = episode;
    if (friends) params.friends = 'true';
    return request(`/reviews?${new URLSearchParams(params)}`, { headers: authHeaders() });
  },
  remove: (id) => request(`/reviews/${id}`, { method: 'DELETE', headers: authHeaders() }),
  like: (id) => request(`/reviews/${id}/like`, { method: 'POST', headers: authHeaders() }),
  unlike: (id) => request(`/reviews/${id}/like`, { method: 'DELETE', headers: authHeaders() }),
};

export const progressAPI = {
  mark: ({ showId, season, episode, watchedAt }) =>
    request('/progress', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ showId, season, episode, watchedAt }) }),
  update: ({ current, next }) =>
    request('/progress', { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ current, next }) }),
  unmark: ({ showId, season, episode }) =>
    request('/progress', { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ showId, season, episode }) }),
  get: ({ showId, season }) => {
    const params = { showId };
    if (season != null) params.season = season;
    return request(`/progress?${new URLSearchParams(params)}`, { headers: authHeaders() });
  },
  history: ({ skip = 0, limit = 60 } = {}) =>
    request(`/progress/history?${new URLSearchParams({ skip, limit })}`, { headers: authHeaders() }),
};

export const feedAPI = {
  get: ({ before, limit = 20 } = {}) => {
    const params = { limit };
    if (before) params.before = before;
    return request(`/feed?${new URLSearchParams(params)}`, { headers: authHeaders() });
  },
};

export const discussionsAPI = {
  get: ({ days = 7, limit = 20 } = {}) =>
    request(`/discussions?${new URLSearchParams({ days, limit })}`, { headers: authHeaders() }),
};
