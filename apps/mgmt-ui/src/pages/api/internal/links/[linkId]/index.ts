import { API_HOST } from '@/pages/api';
import { getInternalTokenOnlyHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const result = await fetch(`${API_HOST}/internal/links/${req.query.linkId}`, {
        method: 'GET',
        headers: getInternalTokenOnlyHeaders(),
      });

      const r = await result.json();
      console.log(`r: `, r);
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
  }
}
