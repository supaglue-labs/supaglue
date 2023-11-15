import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { GetSyncConfigsResponse } from '@supaglue/schemas/v2/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSyncConfigsResponse | null>) {
  let url = `${API_HOST}/internal/sync_configs/${req.query.syncConfigId}`;
  switch (req.method) {
    case 'GET': {
      const result = await fetch(url, {
        method: 'GET',
        headers: getApplicationIdScopedHeaders(req),
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
    case 'DELETE': {
      if (req.query.force_delete_syncs) {
        url += `?force_delete_syncs=${req.query.force_delete_syncs}`;
      }
      const result = await fetch(url, {
        method: 'DELETE',
        headers: getApplicationIdScopedHeaders(req),
      });

      if (!result.ok) {
        const r = await result.json();
        return res.status(result.status).json(r);
      }
      return res.status(204).end();
    }
  }
}
