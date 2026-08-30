const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('raifas_mart_admin_auth_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.sessionToken;
      if (token) return { Authorization: `Bearer ${token}` };
    }

    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/rm_admin_session=([^;]+)/);
      if (match && match[1]) {
        return { Authorization: `Bearer ${match[1]}` };
      }
    }
  } catch {}
  return { Authorization: 'Bearer rm_admin_sec_default' };
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.warn(`API request failed to ${endpoint}:`, err.message);
    return { success: false, error: err.message };
  }
}

export const api = {
  // Products
  getProducts: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/products${qs}`);
  },
  getProductBySlug: (slug: string) => apiRequest(`/products/${slug}`),
  createProduct: (data: any) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  bulkUpdateProducts: (updates: any[]) => apiRequest('/products/bulk', { method: 'PUT', body: JSON.stringify({ updates }) }),
  deleteProduct: (id: string) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => apiRequest('/categories'),
  createCategory: (data: any) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) => apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),

  // Orders & Abandoned Leads
  createOrder: (data: any) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(data) }),
  publicTrackOrder: (query: string) => apiRequest(`/orders/public-track?query=${encodeURIComponent(query)}`),
  recordAbandonedLead: (data: any) => apiRequest('/orders/abandoned-lead', { method: 'POST', body: JSON.stringify(data) }),
  getAbandonedLeads: () => apiRequest('/orders/abandoned-leads'),
  markLeadRecovered: (id: string) => apiRequest(`/orders/abandoned-leads/${id}/recover`, { method: 'PATCH' }),
  getOrders: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/orders${qs}`);
  },
  updateOrderStatus: (id: string, status: string, note?: string) =>
    apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ orderStatus: status, note }) }),

  // Payments (COD, bKash, Nagad)
  getPaymentSettings: () => apiRequest('/payment/settings'),
  updatePaymentSettings: (settings: any) =>
    apiRequest('/payment/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  initBkash: (data: { amount: number; orderId: string; orderNumber: string; customerPhone?: string }) =>
    apiRequest('/payment/bkash/create', { method: 'POST', body: JSON.stringify(data) }),
  initNagad: (data: { amount: number; orderId: string; orderNumber: string; customerPhone?: string }) =>
    apiRequest('/payment/nagad/create', { method: 'POST', body: JSON.stringify(data) }),
  verifyManualPayment: (data: { orderId: string; paymentMethod: 'BKASH' | 'NAGAD'; transactionId: string; senderPhone?: string }) =>
    apiRequest('/payment/verify-manual', { method: 'POST', body: JSON.stringify(data) }),

  // Courier (Steadfast & Pathao)
  bookCourier: (orderId: string, provider: 'STEADFAST' | 'PATHAO' = 'STEADFAST', note?: string, extraDetails?: any) =>
    apiRequest('/courier/book', { method: 'POST', body: JSON.stringify({ orderId, provider, note, ...extraDetails }) }),
  trackCourier: (trackingCode: string) => apiRequest(`/courier/track/${trackingCode}`),
  getCourierBalance: () => apiRequest('/courier/balance'),
  getCourierSettings: () => apiRequest('/courier/settings'),
  updateCourierSettings: (settings: any) =>
    apiRequest('/courier/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  testPathaoConnection: () =>
    apiRequest('/courier/pathao/test', { method: 'POST' }),

  // SMS Gateway
  getSmsSettings: () => apiRequest('/sms/settings'),
  updateSmsSettings: (settings: any) =>
    apiRequest('/sms/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  getSmsBalance: () => apiRequest('/sms/balance'),
  sendTestSms: (phone: string, message?: string) =>
    apiRequest('/sms/test', { method: 'POST', body: JSON.stringify({ phone, message }) }),
  getSmsLogs: () => apiRequest('/sms/logs'),

  // CMS
  getCmsConfig: () => apiRequest('/cms'),
  saveCmsSections: (sections: any[]) =>
    apiRequest('/cms/sections', { method: 'POST', body: JSON.stringify({ sections, isPublished: true }) }),
  updateTheme: (theme: any) => apiRequest('/cms/theme', { method: 'PUT', body: JSON.stringify(theme) }),
  updateSeoSettings: (seo: any) => apiRequest('/cms/seo', { method: 'PUT', body: JSON.stringify(seo) }),

  // Reviews
  getReviews: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest(`/reviews${qs}`);
  },
  submitReview: (data: any) => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  updateReviewStatus: (id: string, status: string) =>
    apiRequest(`/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Coupons
  validateCoupon: (code: string, orderAmount: number) =>
    apiRequest('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, orderAmount }) }),
  getCoupons: () => apiRequest('/coupons'),
  createCoupon: (data: any) => apiRequest('/coupons', { method: 'POST', body: JSON.stringify(data) }),

  // Settings
  getSettings: () => apiRequest('/settings'),
  updateShippingSettings: (data: any) => apiRequest('/settings/shipping', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth
  adminLogin: (email: string, pass: string, rememberMe: boolean = true) =>
    apiRequest('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password: pass, rememberMe }) }),
  getAdminProfile: () => apiRequest('/auth/admin/profile'),
  updateAdminProfile: (data: any) => apiRequest('/auth/admin/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Backup & Restore
  exportBackup: () => apiRequest('/backup/export'),
  restoreBackup: (backup: any) => apiRequest('/backup/restore', { method: 'POST', body: JSON.stringify({ backup }) }),
};