// Admin auth — stored in localStorage (token) + cookie (session flag)
const TOKEN_KEY = 'rm_admin_token';
const USER_KEY = 'rm_admin_user';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// ── Token ─────────────────────────────────────────────────────────────────────

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string, rememberMe = true): void {
  localStorage.setItem(TOKEN_KEY, token);
  const maxAge = rememberMe ? 7 * 24 * 3600 : 24 * 3600;
  document.cookie = `rm_admin_session=1; path=/; max-age=${maxAge}; SameSite=Strict; HttpOnly`;
}

export function clearAdminToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'rm_admin_session=; path=/; max-age=0; SameSite=Strict';
}

// ── User ──────────────────────────────────────────────────────────────────────

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function setAdminUser(user: AdminUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Auth state ────────────────────────────────────────────────────────────────

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken());
}

export function getAuthHeader(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
