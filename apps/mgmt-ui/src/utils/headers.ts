import { SG_INTERNAL_TOKEN } from '@/pages/api';
import { NextApiRequest } from 'next';
import { getOrgId } from './org';

export function getApplicationIdScopedHeaders(req: NextApiRequest) {
  return {
    'Content-Type': 'application/json',
    'x-application-id': req.headers['x-application-id'] as string,
    'x-sg-internal-token': SG_INTERNAL_TOKEN,
    'x-org-id': getOrgId(req),
  };
}

export function getHeaders(req: NextApiRequest) {
  return {
    'Content-Type': 'application/json',
    'x-sg-internal-token': SG_INTERNAL_TOKEN,
    'x-org-id': getOrgId(req),
  };
}
