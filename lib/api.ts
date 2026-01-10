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

export const checkoutApi = (data: any) =>
  apiFetch('/payment/checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const paymentCallbackApi = (params: any) => {
  const queryString = new URLSearchParams(params).toString();
  return apiFetch(`/payment/callback?${queryString}`);
};

export const sendMailApi = (data: any) =>
  apiFetch('/payment/send-mail', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Product Management
export const getProductsApi = () => apiFetch('/products');

export const addProductApi = (data: any) =>
  apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProductApi = (id: number | string, data: any) =>
  apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteProductApi = (id: number | string) =>
  apiFetch(`/products/${id}`, {
    method: 'DELETE',
  });

export const getProductDetailApi = (id: number | string) => apiFetch(`/products/${id}`);

export const getProductVariantsApi = () => apiFetch('/product_variants');

// User Management
export const getUsersApi = () => apiFetch('/users');

export const updateUserApi = (id: number | string, data: any) =>
  apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteUserApi = (id: number | string) =>
  apiFetch(`/users/${id}`, {
    method: 'DELETE',
  });

/* ================= ORDER MANAGEMENT API ================= */

export const getOrdersApi = () => apiFetch('/orders');

export const updateOrderStatusApi = (id: string | number, status: number | string) =>
  apiFetch(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

export const deleteOrderApi = (id: string | number) =>
  apiFetch(`/orders/${id}`, {
    method: 'DELETE',
  });
