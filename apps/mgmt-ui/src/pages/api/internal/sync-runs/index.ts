import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { GetSyncRunsResponse } from '@supaglue/schemas/v2/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSyncRunsResponse | null>) {
  const queryParams = new URLSearchParams();
  req.query?.page_size && queryParams.append('page_size', req.query.page_size as string);
  req.query?.cursor && queryParams.append('cursor', req.query.cursor as string);

  const result = await fetch(`${API_HOST}/internal/sync-runs?${queryParams}`, {
    method: 'GET',
    headers: getApplicationIdScopedHeaders(req),
  });

  const r = await result.json();
  if (!result.ok) {
    return res.status(result.status).json(r);
  }

  return res.status(200).json(r);
}
