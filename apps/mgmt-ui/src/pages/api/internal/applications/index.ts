import { getHeaders } from '@/utils/headers';
import type { Application } from '@supaglue/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ applications: Application[] } | null>
) {
  switch (req.method) {
    case 'GET': {
      const result = await fetch(`${API_HOST}/internal/applications`, {
        method: 'GET',
        headers: await getHeaders(req),
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
    case 'PUT': {
      const result = await fetch(`${API_HOST}/internal/applications`, {
        method: 'PUT',
        headers: await getHeaders(req),
        body: JSON.stringify({
          name: req.body.name,
        }),
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
    default:
      throw new Error(`Invalid method: ${req.method}`);
  }
}
