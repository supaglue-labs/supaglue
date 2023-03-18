import { UpdateIntegrationResponse } from '@supaglue/schemas/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST, SG_INTERNAL_TOKEN } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<UpdateIntegrationResponse | null>) {
  const result = await fetch(`${API_HOST}/internal/v1/integrations/${req.body.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': req.headers['x-application-id'] as string,
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
    },
    body: JSON.stringify(req.body),
  });

  if (!result.ok) {
    return res.status(500).json(null);
  }

  const r = await result.json();

  return res.status(200).json(r);
}
