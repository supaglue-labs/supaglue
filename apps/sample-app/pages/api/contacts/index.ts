import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';
import { getCustomerIdFromRequest } from '../../../lib/util';

const MAX_PER_PAGE = 10;

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ users: any[]; count: number }>) {
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
  const users = await prisma.salesforceContact.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: MAX_PER_PAGE,
    skip: MAX_PER_PAGE * page,
  });
  const count = await prisma.salesforceContact.count({
    where: { customerId },
  });

  res.status(200).json({ users, count });
}
