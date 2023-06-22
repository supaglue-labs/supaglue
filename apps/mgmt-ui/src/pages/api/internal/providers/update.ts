import { getApplicationIdScopedHeaders } from '@/utils/headers';
import { UpdateProviderResponse } from '@supaglue/schemas/v2/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<UpdateProviderResponse | null>) {
  const result = await fetch(`${API_HOST}/internal/providers/${req.body.id}`, {
    method: 'PUT',
    headers: getApplicationIdScopedHeaders(req),
    body: JSON.stringify(req.body),
  });

  const r = await result.json();
  if (!result.ok) {
    return res.status(result.status).json(r);
  }

  return res.status(200).json(r);
}
