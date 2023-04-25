import { getApplicationIdScopedHeaders } from '@/utils/headers';
import { DeleteWebhookResponse } from '@supaglue/schemas/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeleteWebhookResponse | null>) {
  const result = await fetch(`${API_HOST}/internal/v1/webhook`, {
    method: 'DELETE',
    headers: getApplicationIdScopedHeaders(req),
  });

  if (!result.ok) {
    return res.status(500).json(null);
  }

  return res.status(200).json(null);
}
