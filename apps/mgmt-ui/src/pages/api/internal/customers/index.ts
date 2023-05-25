import { getApplicationIdScopedHeaders } from '@/utils/headers';
import { GetCustomersResponse } from '@supaglue/schemas/v1/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetCustomersResponse | null>) {
  const result = await fetch(`${API_HOST}/internal/v1/customers`, {
    method: 'GET',
    headers: getApplicationIdScopedHeaders(req),
  });

  if (!result.ok) {
    return res.status(500).json(null);
  }

  const r = await result.json();

  return res.status(200).json(r);
}
