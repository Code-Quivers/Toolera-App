const PRODUCTS = [
  {
    key: 'PDF_TOOL',
    baseUrl: process.env.PDF_TOOL_URL ?? 'http://localhost:7202',
    apiKey: process.env.ADMIN_LOGS_API_KEY ?? 'toolera_admin_logs_secret_2026',
  },
];

async function fetchProduct(url: string, apiKey: string) {
  const res = await fetch(url, {
    headers: { 'x-admin-api-key': apiKey },
    signal: AbortSignal.timeout(8000),
  });
  return res.json();
}

export const ToolOrdersService = {
  async getAll(query: Record<string, string>) {
    const params = new URLSearchParams(query).toString();
    const results: object[] = [];
    let totalFromProducts = 0;

    for (const p of PRODUCTS) {
      try {
        const data = await fetchProduct(`${p.baseUrl}/api/admin/orders?${params}`, p.apiKey);
        if (data?.success) {
          results.push(...data.data);
          totalFromProducts += data.meta?.total ?? 0;
        }
      } catch { /* product offline */ }
    }

    return { data: results, total: totalFromProducts };
  },

  async getStats() {
    const combined = { total: 0, active: 0, expired: 0, totalRevenue: 0 };

    for (const p of PRODUCTS) {
      try {
        const data = await fetchProduct(`${p.baseUrl}/api/admin/orders/stats`, p.apiKey);
        if (data?.success) {
          const d = data.data;
          combined.total        += d.total        ?? 0;
          combined.active       += d.active        ?? 0;
          combined.expired      += d.expired       ?? 0;
          combined.totalRevenue += d.totalRevenue  ?? 0;
        }
      } catch { /* product offline */ }
    }

    return combined;
  },
};
