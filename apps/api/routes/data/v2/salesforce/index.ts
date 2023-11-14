import { UnauthorizedError } from '@supaglue/core/errors';
import { addLogContext, getCustomerIdPk } from '@supaglue/core/lib';
import type {
  ListSalesforceAccountsPathParams,
  ListSalesforceAccountsQueryParams,
  ListSalesforceAccountsRequest,
  ListSalesforceAccountsResponse,
  ListSalesforceContactsPathParams,
  ListSalesforceContactsQueryParams,
  ListSalesforceContactsRequest,
  ListSalesforceContactsResponse,
} from '@supaglue/schemas/v2/data';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { toSalesforceAccount, toSalesforceContact } from '@/mappers';
import { getDependencyContainer } from '../../../../dependency_container';

const { connectionService, managedDataService } = getDependencyContainer();

async function salesforceConnectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const externalCustomerId = req.headers['x-customer-id'] as string;
  if (!externalCustomerId) {
    throw new UnauthorizedError('x-customer-id header must be set');
  }
  addLogContext('externalCustomerId', externalCustomerId);

  req.customerId = externalCustomerId;
  addLogContext('customerId', req.customerId);

  req.customerConnection = await connectionService.getSafeByCustomerIdAndApplicationIdAndProviderName({
    customerId: getCustomerIdPk(req.supaglueApplication.id, externalCustomerId),
    applicationId: req.supaglueApplication.id,
    providerName: 'salesforce',
  });
  addLogContext('connectionId', req.customerConnection?.id);

  next();
}

export default function init(app: Router): void {
  const router = Router();
  router.use(salesforceConnectionMiddleware);

  router.get(
    '/accounts',
    async (
      req: Request<
        ListSalesforceAccountsPathParams,
        ListSalesforceAccountsResponse,
        ListSalesforceAccountsRequest,
        ListSalesforceAccountsQueryParams
      >,
      res: Response<ListSalesforceAccountsResponse>
    ) => {
      const { pagination, records } = await managedDataService.getStandardRecords(
        req.supaglueApplication.id,
        'salesforce',
        req.customerId,
        'Account',
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      return res.status(200).send({ pagination, records: records.map(toSalesforceAccount) });
    }
  );

  router.get(
    '/contacts',
    async (
      req: Request<
        ListSalesforceContactsPathParams,
        ListSalesforceContactsResponse,
        ListSalesforceContactsRequest,
        ListSalesforceContactsQueryParams
      >,
      res: Response<ListSalesforceContactsResponse>
    ) => {
      const { pagination, records } = await managedDataService.getStandardRecords(
        req.supaglueApplication.id,
        'salesforce',
        req.customerId,
        'Contact',
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      return res.status(200).send({ pagination, records: records.map(toSalesforceContact) });
    }
  );

  app.use('/salesforce', router);
}
