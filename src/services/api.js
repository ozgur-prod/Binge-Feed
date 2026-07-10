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
  getFollowers: (id) => request(`/users/${id}/followers`),
  getFollowing: (id) => request(`/users/${id}/following`),
};

export const showsAPI = {
  getPopular: () => request('/shows/popular'),
  getTrending: () => request('/shows/trending'),
  search: (query) => request(`/shows/search?q=${encodeURIComponent(query)}`),
  getDetails: (id) => request(`/shows/${id}`),
  getSeason: (id, season) => request(`/shows/${id}/season/${season}`),
  getWatchProviders: (id) => request(`/shows/${id}/watch-providers`),
  discover: (filters) => request(`/shows/discover?${new URLSearchParams(filters)}`),
};

export const favoritesAPI = {
  list: (userId) => request(`/users/${userId}/favorites`),
  add: (body) => request('/users/me/favorites', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }),
  remove: (showId) => request(`/users/me/favorites/${showId}`, { method: 'DELETE', headers: authHeaders() }),
};

export const listsAPI = {
  list: (userId) => request(`/users/${userId}/lists`),
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
