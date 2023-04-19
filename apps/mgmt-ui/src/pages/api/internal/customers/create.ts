import { getApplicationIdScopedHeaders } from '@/utils/headers';
import { UpsertCustomerResponse } from '@supaglue/schemas/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<UpsertCustomerResponse | null>) {
  const result = await fetch(`${API_HOST}/internal/v1/customers`, {
    method: 'PUT',
    headers: getApplicationIdScopedHeaders(req),
    body: JSON.stringify(req.body),
  });

  if (!result.ok) {
    return res.status(500).json(null);
  }

  const r = await result.json();

  return res.status(200).json(r);
}
