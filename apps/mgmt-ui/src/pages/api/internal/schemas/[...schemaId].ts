import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { GetSchemasResponse } from '@supaglue/sdk/v2/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

/**
 * @deprecated
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<GetSchemasResponse | null>) {
  switch (req.method) {
    case 'GET': {
      const result = await fetch(`${API_HOST}/internal/schemas/${req.query.schemaId}`, {
        method: 'GET',
        headers: await getApplicationIdScopedHeaders(req),
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
    case 'DELETE': {
      const result = await fetch(`${API_HOST}/internal/schemas/${req.query.schemaId}`, {
        method: 'DELETE',
        headers: await getApplicationIdScopedHeaders(req),
      });

      if (!result.ok) {
        const r = await result.json();
        return res.status(result.status).json(r);
      }
      return res.status(204).end();
    }
  }
}
