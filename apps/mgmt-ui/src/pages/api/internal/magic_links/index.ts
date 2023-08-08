import { getApplicationIdScopedHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST': {
      const result = await fetch(`${API_HOST}/internal/magic_links`, {
        method: 'POST',
        headers: getApplicationIdScopedHeaders(req),
        body: JSON.stringify(req.body),
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
  }
}
