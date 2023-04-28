import { getOrgId } from '@/utils/org';
import { DeleteWebhookResponse } from '@supaglue/schemas/mgmt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { API_HOST, SG_INTERNAL_TOKEN } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeleteWebhookResponse | null>) {
  const result = await fetch(`${API_HOST}/internal/v1/webhook`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-application-id': req.headers['x-application-id'] as string,
      'x-sg-internal-token': SG_INTERNAL_TOKEN,
      'x-org-id': getOrgId(req),
    },
  });

  if (!result.ok) {
    return res.status(500).json(null);
  }

  return res.status(200).json(null);
}
