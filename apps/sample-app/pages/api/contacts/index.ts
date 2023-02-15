import { NextApiRequest, NextApiResponse } from 'next';

import supaglueSdk, { SalesforceContact } from '../../../lib/supaglue_sdk';
import { getCustomerIdFromRequest } from '../../../lib/util';

const MAX_PER_PAGE = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ users: SalesforceContact[]; count: number }>
) {
  if (req.method !== 'GET') {
    throw new Error(`Invalid method: ${req.method}`);
  }

  const customerId = await getCustomerIdFromRequest(req);
  if (!customerId) {
    // Not signed in
    res.status(401);
    return;
  }

  if (req.query.page instanceof Array) {
    throw new Error('Multiple pages provided');
  }

  const page = req.query.page ? parseInt(req.query.page) : 0;

  const users = await supaglueSdk.crmContact.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: MAX_PER_PAGE,
    skip: MAX_PER_PAGE * page,
  });
  const count = await supaglueSdk.crmContact.count({
    where: { customerId },
  });

  res.status(200).json({ users, count });
}

const example = () => {
  const result = supaglueSdk.crmContact.create({
    data: {
      email: 'test@email.com',
      title: 'title',
      firstName: 'tom',
      lastName: 'chen',
      customerId: 'user1',
    },
  });
};
