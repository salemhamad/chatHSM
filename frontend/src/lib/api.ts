const getApiBaseUrl = () => {
  // Use environment variables first if available
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Backend runs on 3009 as per user server setup, or 3009 locally
      return 'http://localhost:3009/api'; 
    }
    return `${window.location.origin}/api`;
  }
  
  return 'http://localhost:3009/api';
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
