import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      if (!req.query.name) {
        return res.status(200).json({ properties: [] });
      }
      const result = await fetch(`${API_HOST}/internal/properties?type=${req.query.type}&name=${req.query.name}`, {
        method: 'GET',
        headers: {
          ...getApplicationIdScopedHeaders(req),
          'x-customer-id': req.query.customer_id as string,
          'x-provider-name': req.query.provider_name as string,
        },
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
  }
}
