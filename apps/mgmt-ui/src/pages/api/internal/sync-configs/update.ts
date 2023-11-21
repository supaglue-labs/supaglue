import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { UpdateSyncConfigResponse } from '@supaglue/schemas/v2/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<UpdateSyncConfigResponse | null>) {
  let url = `${API_HOST}/internal/sync_configs/${req.body.id}`;
  if (req.query.force_delete_syncs) {
    url += `?force_delete_syncs=${req.query.force_delete_syncs}`;
  }
  const result = await fetch(url, {
    method: 'PUT',
    headers: await getApplicationIdScopedHeaders(req),
    body: JSON.stringify(req.body),
  });

  const r = await result.json();
  if (!result.ok) {
    return res.status(result.status).json(r);
  }

  return res.status(200).json(r);
}
