const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function apiFetch(
  endpoint: string,
  options: RequestInit & { isFormData?: boolean } = {}
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Tự động set header, bỏ Content-Type nếu là FormData
  const headers: Record<string, string> = options.isFormData
    ? { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    : {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) throw new Error(`API không trả JSON. Status ${res.status}. Response: ${text}`);
  }

  if (!res.ok) {
    throw new Error(data?.message || 'Request thất bại');
  }

  return data;
}

/* ================= AUTH API ================= */

export const registerApi = (data: any) => apiFetch('/register', { method: 'POST', body: data });
export const verifyEmailApi = (data: any) => apiFetch('/verify-email', { method: 'POST', body: data });
export const resendCodeApi = (data: any) => apiFetch('/resend-code', { method: 'POST', body: data });
export const loginApi = (data: any) => apiFetch('/login', { method: 'POST', body: data });
export const getProfileApi = () => apiFetch('/profile');
export const logoutApi = () => apiFetch('/logout', { method: 'POST' });
export const getMeApi = () => apiFetch('/user');

/* ================= PAYMENT ================= */
export const checkoutApi = (data: any) => apiFetch('/payment/checkout', { method: 'POST', body: data });
export const paymentCallbackApi = (params: any) => {
  const queryString = new URLSearchParams(params).toString();
  return apiFetch(`/payment/callback?${queryString}`);
};
export const sendMailApi = (data: any) => apiFetch('/payment/send-mail', { method: 'POST', body: data });

/* ================= PRODUCT MANAGEMENT ================= */
export const getProductsApi = () => apiFetch('/products');
export const getProductByIdApi = (id: string | number) => apiFetch(`/products/${id}`);
export const addProductApi = (data: any) => apiFetch('/products', { method: 'POST', body: data });
export const updateVariantApi = (IdProduct: string, IdProductVar: string, data: FormData) =>
  apiFetch(`/products/${IdProduct}/variant/${IdProductVar}/update`, {
    method: 'POST',
    body: data,
    isFormData: true,
  });
export const deleteProductApi = (id: string) => apiFetch(`/products/${id}`, { method: 'DELETE' });
export const getProductDetailApi = (id: string | number) => apiFetch(`/products/${id}`);
export const getProductVariantsApi = () => apiFetch('/product_variants');

/* ================= USER MANAGEMENT ================= */
export const getUsersApi = () => apiFetch('/users');
export const updateUserApi = (id: string | number, data: any) => apiFetch(`/users/${id}`, { method: 'PUT', body: data });
export const deleteUserApi = (id: string | number) => apiFetch(`/users/${id}`, { method: 'DELETE' });
export const updateUserRoleApi = (idUser: string, role: string) =>
  apiFetch(`/users/${idUser}/role`, {
    method: 'PUT',
    body: JSON.stringify({ Role: role }),
  });

/* ================= ORDER MANAGEMENT ================= */
export const getOrdersApi = () => apiFetch('/orders');
export const updateOrderStatusApi = (id: string | number, status: string | number) =>
  apiFetch(`/orders/${id}/status`, { 
    method: 'PUT', 
    body: JSON.stringify({ status })
  });
export const deleteOrderApi = (id: string | number) => apiFetch(`/orders/${id}`, { method: 'DELETE' });
