export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // In React, we will handle this in AuthContext or Interceptor
      // For now, throw an error to let React Query catch it and trigger logout
      const error = new Error(data.message || 'Session expired.');
      error.status = response.status;
      throw error;
    }
    const error = new Error(data.message || 'An error occurred');
    error.status = response.status;
    throw error;
  }

  return data;
};
