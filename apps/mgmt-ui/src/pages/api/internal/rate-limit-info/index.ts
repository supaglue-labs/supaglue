import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const result = await fetch(
        `${API_HOST}/internal/customers/${req.query.customerId}/connections/${req.query.providerName}/_rate_limit_info`,
        {
          method: 'GET',
          headers: await getApplicationIdScopedHeaders(req),
        }
      );

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
  }
}
