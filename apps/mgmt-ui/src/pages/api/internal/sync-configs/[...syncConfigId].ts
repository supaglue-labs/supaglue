import { getApplicationIdScopedHeaders } from '@/utils/headers';
import { GetSyncConfigsResponse } from '@supaglue/schemas/v2/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSyncConfigsResponse | null>) {
  switch (req.method) {
    case 'GET': {
      const result = await fetch(`${API_HOST}/internal/sync_configs/${req.query.syncConfigId}`, {
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
      const result = await fetch(`${API_HOST}/internal/sync_configs/${req.query.syncConfigId}`, {
        method: 'DELETE',
        headers: getApplicationIdScopedHeaders(req),
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(204).json(r);
    }
  }
}
