import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { UpsertCustomerResponse } from '@supaglue/schemas/v2/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<UpsertCustomerResponse | object>) {
  switch (req.method) {
    case 'PUT': {
      const result = await fetch(`${API_HOST}/internal/customers`, {
        method: 'PUT',
        headers: getApplicationIdScopedHeaders(req),
        body: JSON.stringify(req.body),
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }

    case 'DELETE': {
      const result = await fetch(`${API_HOST}/internal/customers/${req.query.customerId}`, {
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
