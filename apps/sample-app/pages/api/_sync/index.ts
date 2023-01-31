import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';

interface OpportunitiesPostRequest extends NextApiRequest {
  body: {
    data: {
      metadata: {
        timestamp: string;
        syncConfigName: string;
        syncId: string;
        syncRunId: string;
        customerId: string;
        host: string;
      };
      record: {
        salesforce_id: string;
        name: string;
        stage: string;
        salesforce_account_id?: string;
        close_date: string;
      };
    };
  };
}

export default async function handler(req: OpportunitiesPostRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    throw new Error(`Invalid method: ${req.method}`);
  }

  const { metadata, record } = req.body.data;
  const { customerId } = metadata;
  const { salesforce_id, name, salesforce_account_id, close_date, stage } = record;
  // Only `Closed Won` cases
  if (stage !== 'Closed Won') {
    res.status(200).json({});
    return;
  }

  await prisma.salesforceOpportunity.upsert({
    where: {
      customerId_salesforceId: {
        salesforceId: salesforce_id,
        customerId,
      },
    },
    update: {
      name,
      salesforceAccountId: salesforce_account_id,
      closeDate: new Date(close_date),
      stage,
      syncTimestamp: new Date(metadata.timestamp),
    },
    create: {
      salesforceId: salesforce_id,
      customerId,
      name,
      salesforceAccountId: salesforce_account_id,
      closeDate: new Date(close_date),
      stage,
      syncTimestamp: new Date(metadata.timestamp),
    },
  });
  res.status(200).json({});
}
