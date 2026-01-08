const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body,
  });

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(
      `API không trả JSON. Status ${res.status}. Response: ${text}`
    );
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

/* ================= AUTH API ================= */

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

export function getMeApi() {
  return apiFetch('/user');
}

export async function checkoutApi(data: any) {
  const res = await fetch(`${API_URL}/payment/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  // Check if response is JSON
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const result = await res.json()
    if (!res.ok) {
      throw new Error(result.message || 'Checkout failed')
    }
    return result
  } else {
    // Handle non-JSON response (likely an error page or empty)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Checkout failed: ${res.status} ${res.statusText}`)
    }
    return true // Or some default success if no JSON returned
  }
}

export async function paymentCallbackApi(params: any) {
  const queryString = new URLSearchParams(params).toString()
  const res = await fetch(`${API_URL}/payment/callback?${queryString}`, {
    method: 'GET', // Or POST depending on provider, usually GET for callback redirects
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const result = await res.json()
  if (!res.ok) {
    throw new Error(result.message || 'Payment callback failed')
  }
  return result
}

export async function sendMailApi(data: any) {
  const res = await fetch(`${API_URL}/payment/send-mail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await res.json()
  if (!res.ok) {
    throw new Error(result.message || 'Send mail failed')
  }
  return result
}

// Product Management
export async function getProductsApi() {
  const res = await fetch(`${API_URL}/products`)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message || 'Failed to fetch products')
  return result
}

export async function addProductApi(data: any) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.message || 'Failed to add product')
  return result
}

export async function updateProductApi(id: number | string, data: any) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.message || 'Failed to update product')
  return result
}

export async function deleteProductApi(id: number | string) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE'
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.message || 'Failed to delete product')
  return result
}

// User Management
export async function getUsersApi() {
  // Try to fetch all users. If backend doesn't have /users, this will need adjustment.
  const res = await fetch(`${API_URL}/users`)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message || 'Failed to fetch users')
  return result
}

export async function updateUserApi(id: number | string, data: any) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.message || 'Failed to update user')
  return result
}

export async function deleteUserApi(id: number | string) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE'
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.message || 'Failed to delete user')
  return result
}
