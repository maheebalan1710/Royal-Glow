// API Service helper for Node.js Express backend
// Uses fetch API with JWT Bearer Token

const API_BASE = '/api';

export const getAuthToken = () => {
  return localStorage.getItem('salon_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('salon_token', token);
  } else {
    localStorage.removeItem('salon_token');
  }
};

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong with the request');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};
