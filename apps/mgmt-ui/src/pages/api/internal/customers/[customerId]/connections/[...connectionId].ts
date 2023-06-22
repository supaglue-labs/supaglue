import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../../../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'DELETE': {
      const result = await fetch(
        `${API_HOST}/internal/customers/${req.query.customerId}/connections/${req.query.connectionId}`,
        {
          method: 'DELETE',
          headers: getApplicationIdScopedHeaders(req),
        }
      );

      if (!result.ok) {
        const r = await result.json();
        return res.status(result.status).json(r);
      }
      return res.status(204).json({});
    }
  }
}
