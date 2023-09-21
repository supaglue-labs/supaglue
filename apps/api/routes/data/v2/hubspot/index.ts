import { configureScope } from '@sentry/node';
import { UnauthorizedError } from '@supaglue/core/errors';
import { addLogContext, getCustomerIdPk } from '@supaglue/core/lib';
import type {
  ListHubspotCompaniesPathParams,
  ListHubspotCompaniesQueryParams,
  ListHubspotCompaniesRequest,
  ListHubspotCompaniesResponse,
  ListHubspotContactsPathParams,
  ListHubspotContactsQueryParams,
  ListHubspotContactsRequest,
  ListHubspotContactsResponse,
} from '@supaglue/schemas/v2/data';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { toHubspotCompany, toHubspotContact } from '@/mappers/hubspot';
import { getDependencyContainer } from '../../../../dependency_container';

const { connectionService, managedDataService } = getDependencyContainer();

async function hubspotConnectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const externalCustomerId = req.headers['x-customer-id'] as string;
  if (!externalCustomerId) {
    throw new UnauthorizedError('x-customer-id header must be set');
  }
  addLogContext('externalCustomerId', externalCustomerId);
  configureScope((scope) => {
    scope.setTag('externalCustomerId', externalCustomerId);
    scope.setTag('providerName', 'hubspot');
  });

  req.customerId = externalCustomerId;
  addLogContext('customerId', req.customerId);
  configureScope((scope) => scope.setTag('customerId', req.customerId));

  req.customerConnection = await connectionService.getSafeByCustomerIdAndApplicationIdAndProviderName({
    customerId: getCustomerIdPk(req.supaglueApplication.id, externalCustomerId),
    applicationId: req.supaglueApplication.id,
    providerName: 'hubspot',
  });
  addLogContext('connectionId', req.customerConnection?.id);
  configureScope((scope) => scope.setTag('connectionId', req.customerConnection?.id));

  next();
}

export default function init(app: Router): void {
  const router = Router();
  router.use(hubspotConnectionMiddleware);

  router.get(
    '/companies',
    async (
      req: Request<
        ListHubspotCompaniesPathParams,
        ListHubspotCompaniesResponse,
        ListHubspotCompaniesRequest,
        ListHubspotCompaniesQueryParams
      >,
      res: Response<ListHubspotCompaniesResponse>
    ) => {
      const { pagination, records } = await managedDataService.getStandardRecords(
        req.supaglueApplication.id,
        'hubspot',
        req.customerId,
        'company',
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      return res.status(200).send({ pagination, records: records.map(toHubspotCompany) });
    }
  );

  router.get(
    '/contacts',
    async (
      req: Request<
        ListHubspotContactsPathParams,
        ListHubspotContactsResponse,
        ListHubspotContactsRequest,
        ListHubspotContactsQueryParams
      >,
      res: Response<ListHubspotContactsResponse>
    ) => {
      const { pagination, records } = await managedDataService.getStandardRecords(
        req.supaglueApplication.id,
        'hubspot',
        req.customerId,
        'contact',
        req.query?.cursor,
        req.query?.modified_after as unknown as string | undefined,
        req.query?.page_size ? parseInt(req.query.page_size) : undefined
      );
      return res.status(200).send({ pagination, records: records.map(toHubspotContact) });
    }
  );

  app.use('/hubspot', router);
}
