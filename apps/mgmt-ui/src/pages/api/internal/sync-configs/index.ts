import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { GetSyncConfigsResponse } from '@supaglue/sdk/v2/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSyncConfigsResponse | null>) {
  const result = await fetch(`${API_HOST}/internal/sync_configs`, {
    method: 'GET',
    headers: await getApplicationIdScopedHeaders(req),
  });

  const r = await result.json();
  if (!result.ok) {
    return res.status(result.status).json(r);
  }

  return res.status(200).json(r);
}
