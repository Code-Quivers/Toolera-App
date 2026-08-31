const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api/v1';

const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY;

export async function internalFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const url = `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': INTERNAL_KEY,
        ...options.headers,
      },
      cache: 'no-store',
    });
    return await res.json();
  } catch (err: any) {
    console.warn(`[Internal API] ${endpoint}:`, err.message);
    return { success: false, message: err.message };
  }
}
