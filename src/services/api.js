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
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
};

export const showsAPI = {
  getPopular: (page = 1) => request(`/shows/popular?page=${page}`),
  getTrending: (page = 1) => request(`/shows/trending?page=${page}`),
  search: (q, page = 1) => request(`/shows/search?q=${encodeURIComponent(q)}&page=${page}`),
  getDetails: (id) => request(`/shows/${id}`),
};
