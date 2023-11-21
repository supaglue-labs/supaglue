import { SG_INTERNAL_TOKEN } from '@/pages/api';
import type { GetServerSidePropsContext, NextApiRequest } from 'next';
import { getOrgId } from './org';
import { getToken } from './token';

export async function getApplicationIdScopedHeaders(req: NextApiRequest | GetServerSidePropsContext['req']) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-application-id': req.headers['x-application-id'] as string,
    'x-sg-internal-token': SG_INTERNAL_TOKEN,
    'x-org-id': getOrgId(req),
  };

  const token = await getToken(req);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function getHeaders(req: NextApiRequest | GetServerSidePropsContext['req']) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-sg-internal-token': SG_INTERNAL_TOKEN,
    'x-org-id': getOrgId(req),
  };
  const token = await getToken(req);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function getInternalTokenOnlyHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-sg-internal-token': SG_INTERNAL_TOKEN,
  };
}
