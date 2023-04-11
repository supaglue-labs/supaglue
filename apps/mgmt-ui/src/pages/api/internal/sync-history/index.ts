import { getOrgId } from '@/utils/org';
import { GetSyncHistoryResponse } from '@supaglue/schemas/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST, SG_INTERNAL_TOKEN } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSyncHistoryResponse | null>) {
  const result = await fetch(`${API_HOST}/internal/v1/sync-history?page_size=1000`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': req.headers['x-application-id'] as string,
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
      'x-org-id': getOrgId(req),
    },
  });

  if (!result.ok) {
    return res.status(500).json(null);
  }

  const r = await result.json();

  return res.status(200).json(r);
}
