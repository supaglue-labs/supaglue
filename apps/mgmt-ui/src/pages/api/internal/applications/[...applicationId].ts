import { getOrgId } from '@/utils/org';
import { Application } from '@supaglue/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST, SG_INTERNAL_TOKEN } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<Application | null>) {
  switch (req.method) {
    case 'GET': {
      const result = await fetch(`${API_HOST}/internal/v1/applications/${req.query.applicationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-sg-internal-token': SG_INTERNAL_TOKEN,
          'x-org-id': getOrgId(req),
        },
      });

      if (!result.ok) {
        return res.status(500).json(null);
      }

      const r = await result.json();

      return res.status(200).json(r);
    }
    case 'PATCH': {
      const result = await fetch(`${API_HOST}/internal/v1/applications/${req.query.applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-sg-internal-token': SG_INTERNAL_TOKEN,
          'x-org-id': getOrgId(req),
        },
        body: JSON.stringify(req.body),
      });

      if (!result.ok) {
        return res.status(500).json(null);
      }

      const r = await result.json();

      return res.status(200).json(r);
    }
    case 'DELETE': {
      const result = await fetch(`${API_HOST}/internal/v1/applications/${req.query.applicationId}`, {
        method: 'DELETE',
        headers: {
          'x-sg-internal-token': SG_INTERNAL_TOKEN,
          'x-org-id': getOrgId(req),
        },
      });

      if (!result.ok) {
        return res.status(500).json(null);
      }

      return res.status(204).send(null);
    }
  }
}
