import { internalFetch } from '@/lib/api/internal';

export async function getCurrentStore(userId?: string) {
  try {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await internalFetch(`/internal/store${qs}`);
    return res.success && res.data ? res.data : null;
  } catch (error) {
    console.error('[getCurrentStore] Error:', error);
    return null;
  }
}
