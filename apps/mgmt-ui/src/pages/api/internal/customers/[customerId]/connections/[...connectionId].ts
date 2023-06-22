import { getApplicationIdScopedHeaders } from '@/utils/headers';
import { Application } from '@supaglue/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../../../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Application | null>) {
  switch (req.method) {
    case 'DELETE': {
      const result = await fetch(
        `${API_HOST}/internal/customers/${req.query.customerId}/connections/${req.query.connectionId}`,
        {
          method: 'DELETE',
          headers: getApplicationIdScopedHeaders(req),
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
