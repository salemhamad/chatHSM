const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }
  return 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

const getHeaders = (headers: Record<string, string> = {}) => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
};

export const apiClient = {
  async get(endpoint: string, headers = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(headers),
    });
    if (response.status === 401) {
      removeToken();
    }
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async post(endpoint: string, data?: any, headers = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(headers),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (response.status === 401) {
      removeToken();
    }
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async patch(endpoint: string, data: any, headers = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(headers),
      body: JSON.stringify(data),
    });
    if (response.status === 401) {
      removeToken();
    }
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  async delete(endpoint: string, headers = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(headers),
    });
    if (response.status === 401) {
      removeToken();
    }
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};
