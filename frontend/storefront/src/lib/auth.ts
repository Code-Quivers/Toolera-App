// Customer auth — token in localStorage + session cookie
const TOKEN_KEY = 'rm_customer_token';
const USER_KEY = 'rm_customer_user';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

// ── Token ─────────────────────────────────────────────────────────────────────

export function getCustomerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `rm_customer_session=1; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict`;
}

export function clearCustomerToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'rm_customer_session=; path=/; max-age=0; SameSite=Strict';
}

// ── User ──────────────────────────────────────────────────────────────────────

export function getCustomerUser(): CustomerUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as CustomerUser) : null;
  } catch {
    return null;
  }
}

export function setCustomerUser(user: CustomerUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Auth state ────────────────────────────────────────────────────────────────

export function isCustomerAuthenticated(): boolean {
  return Boolean(getCustomerToken());
}

export function getAuthHeader(): Record<string, string> {
  const token = getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
