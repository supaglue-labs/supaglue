import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { CreateEntityResponse } from '@supaglue/schemas/v2/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

/**
 * @deprecated
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<CreateEntityResponse | null>) {
  const result = await fetch(`${API_HOST}/internal/entities`, {
    method: 'POST',
    headers: await getApplicationIdScopedHeaders(req),
    body: JSON.stringify(req.body),
  });

  const r = await result.json();
  if (!result.ok) {
    return res.status(result.status).json(r);
  }

  return res.status(200).json(r);
}
