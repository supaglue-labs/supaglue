import { API_HOST } from '@/pages/api';
import { getInternalTokenOnlyHeaders } from '@/utils/headers';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST': {
      const result = await fetch(`${API_HOST}/internal/links/${req.query.linkId}/_consume`, {
        method: 'POST',
        headers: getInternalTokenOnlyHeaders(),
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
