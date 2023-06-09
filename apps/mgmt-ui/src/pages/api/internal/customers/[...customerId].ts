import { getApplicationIdScopedHeaders } from '@/utils/headers';
import { UpsertCustomerResponse } from '@supaglue/schemas/v1/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<UpsertCustomerResponse | null>) {
  switch (req.method) {
    case 'PUT': {
      const result = await fetch(`${API_HOST}/internal/customers`, {
        method: 'PUT',
        headers: getApplicationIdScopedHeaders(req),
        body: JSON.stringify(req.body),
      });

      if (!result.ok) {
        return res.status(500).json(null);
      }

      const r = await result.json();

      return res.status(200).json(r);
    }

    case 'DELETE': {
      const result = await fetch(`${API_HOST}/internal/customers/${req.query.customerId}`, {
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
