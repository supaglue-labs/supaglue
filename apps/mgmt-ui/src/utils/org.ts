import { IS_CLOUD, ORGANIZATION_ID } from '@/pages/api';
import { getAuth } from '@clerk/nextjs/server';
import { NextApiRequest } from 'next';

export const getOrgId = (req: NextApiRequest): string => {
  if (!IS_CLOUD) {
    return ORGANIZATION_ID;
  }
  const { orgId } = getAuth(req);
  if (!orgId) {
    throw new Error(`Could not get orgId from request`);
  }
  return orgId;
};
