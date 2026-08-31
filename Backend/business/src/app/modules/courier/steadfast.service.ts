import { eq } from 'drizzle-orm';
import { rdb, db } from '../../db/index.js';
import { courierSettingsTable } from '../../db/schema.js';

const STEADFAST_BASE_URL = 'https://portal.steadfast.com.bd/api/v1';

async function getCredentials() {
  const settings = await rdb().select().from(courierSettingsTable).limit(1).then(r => r[0] ?? null);
  const apiKey = settings?.steadfastApiKey || process.env.STEADFAST_API_KEY || 'demo_api_key';
  const secretKey = settings?.steadfastSecretKey || process.env.STEADFAST_SECRET_KEY || 'demo_secret_key';
  return { apiKey, secretKey };
}

export interface SteadfastOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

export async function createSteadfastOrder(payload: SteadfastOrderPayload) {
  const { apiKey, secretKey } = await getCredentials();

  if (apiKey === 'demo_api_key' || !apiKey) {
    const mockTracking = `SF${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
    const mockConsignment = `CSG_${Date.now().toString().slice(-8)}`;
    return {
      success: true,
      status: 200,
      consignment: {
        consignment_id: mockConsignment,
        tracking_code: mockTracking,
        status: 'in_review',
        invoice: payload.invoice,
        recipient_name: payload.recipient_name,
        cod_amount: payload.cod_amount,
      },
    };
  }

  const res = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': apiKey, 'Secret-Key': secretKey },
    body: JSON.stringify(payload),
  });

  const json: any = await res.json();
  if (json?.status === 200 && json?.consignment) {
    return { success: true, status: 200, consignment: json.consignment };
  }
  throw new Error(json?.message || 'Failed to create Steadfast order');
}

export async function checkSteadfastStatus(trackingCode: string) {
  const { apiKey, secretKey } = await getCredentials();

  if (apiKey === 'demo_api_key' || !apiKey) {
    return {
      success: true,
      delivery_status: 'in_transit',
      tracking_code: trackingCode,
      timeline: [
        { status: 'Order Placed', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { status: 'Picked Up by Steadfast Courier', timestamp: new Date(Date.now() - 36000000).toISOString() },
        { status: 'In Transit to Destination Hub', timestamp: new Date().toISOString() },
      ],
    };
  }

  const res = await fetch(`${STEADFAST_BASE_URL}/status_by_trackingcode/${trackingCode}`, {
    headers: { 'Api-Key': apiKey, 'Secret-Key': secretKey },
  });
  return { success: true, data: await res.json() };
}

export async function getSteadfastBalance() {
  const { apiKey, secretKey } = await getCredentials();
  if (apiKey === 'demo_api_key' || !apiKey) {
    return { success: true, current_balance: 0, formatted: '৳0.00' };
  }
  const res = await fetch(`${STEADFAST_BASE_URL}/get_balance`, {
    headers: { 'Api-Key': apiKey, 'Secret-Key': secretKey },
  });
  return await res.json();
}
