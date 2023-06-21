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

      if (!result.ok) {
        return res.status(500).json(null);
      }

      const r = await result.json();

      return res.status(200).json(r);
    }
    case 'DELETE': {
      const result = await fetch(`${API_HOST}/internal/sync_configs/${req.query.syncConfigId}`, {
        method: 'DELETE',
        headers: getApplicationIdScopedHeaders(req),
      });

      if (!result.ok) {
        return res.status(500).json(null);
      }

      return res.status(204).send(null);
    }
  }
}
