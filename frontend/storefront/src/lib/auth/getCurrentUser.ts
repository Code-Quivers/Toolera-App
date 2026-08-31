import { internalFetch } from '@/lib/api/internal';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'MANAGER' | 'STAFF';
}

export async function getCurrentUser(userId?: string): Promise<AuthenticatedUser | null> {
  try {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await internalFetch<AuthenticatedUser>(`/internal/user${qs}`);
    return res.success && res.data ? res.data : null;
  } catch (error) {
    console.error('[getCurrentUser] Error:', error);
    return null;
  }
}
