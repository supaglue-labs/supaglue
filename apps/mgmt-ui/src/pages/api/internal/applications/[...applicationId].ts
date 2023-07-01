import { getHeaders } from '@/utils/headers';
import { getOrgId } from '@/utils/org';
import type { Application } from '@supaglue/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST, SG_INTERNAL_TOKEN } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Application | object>) {
  switch (req.method) {
    case 'GET': {
      const result = await fetch(`${API_HOST}/internal/applications/${req.query.applicationId}`, {
        method: 'GET',
        headers: getHeaders(req),
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
    case 'PATCH': {
      const result = await fetch(`${API_HOST}/internal/applications/${req.query.applicationId}`, {
        method: 'PATCH',
        headers: getHeaders(req),
        body: JSON.stringify(req.body),
      });

      const r = await result.json();
      if (!result.ok) {
        return res.status(result.status).json(r);
      }

      return res.status(200).json(r);
    }
    case 'DELETE': {
      const result = await fetch(`${API_HOST}/internal/applications/${req.query.applicationId}`, {
        method: 'DELETE',
        headers: {
          'x-sg-internal-token': SG_INTERNAL_TOKEN,
          'x-org-id': getOrgId(req),
        },
      });

      if (!result.ok) {
        const r = await result.json();
        return res.status(result.status).json(r);
      }
      return res.status(204).json({});
    }
  }
}
