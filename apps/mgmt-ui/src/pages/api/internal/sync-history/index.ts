import { getApplicationIdScopedHeaders } from '@/utils/headers';
import { GetSyncHistoryResponse } from '@supaglue/schemas/v1/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSyncHistoryResponse | null>) {
  const queryParams = new URLSearchParams();
  req.query?.page_size && queryParams.append('page_size', req.query.page_size as string);
  req.query?.cursor && queryParams.append('cursor', req.query.cursor as string);

  const result = await fetch(`${API_HOST}/internal/v1/sync-history?${queryParams}`, {
    method: 'GET',
    headers: getApplicationIdScopedHeaders(req),
  });

  if (!result.ok) {
    return res.status(500).json(null);
  }

  const r = await result.json();

  return res.status(200).json(r);
}
