const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const registerApi = (data: {
  UserName: string;
  Email: string;
  Password: string;
  Password_confirmation: string;
}) =>
  apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyEmailApi = (data: {
  Email: string;
  Code: string;
}) =>
  apiFetch('/verify-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const resendCodeApi = (data: { Email: string }) =>
  apiFetch('/resend-code', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const loginApi = (data: {
  Email: string;
  Password: string;
}) =>
  apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getProfileApi = () => apiFetch('/profile');

export const logoutApi = () =>
  apiFetch('/logout', { method: 'POST' });
