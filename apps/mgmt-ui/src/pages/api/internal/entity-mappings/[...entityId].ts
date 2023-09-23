import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

/**
 * @deprecated
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PUT': {
      const result = await fetch(`${API_HOST}/internal/entity_mappings/${req.query.entityId}`, {
        method: 'PUT',
        headers: {
          ...getApplicationIdScopedHeaders(req),
          'x-customer-id': req.query.customer_id as string,
          'x-provider-name': req.query.provider_name as string,
        },
        body: JSON.stringify(req.body),
      });

      if (!result.ok) {
        const r = await result.json();
        return res.status(result.status).json(r);
      }
      return res.status(200).json(null);
    }
  }
}
