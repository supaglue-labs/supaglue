import { configureScope } from '@sentry/node';
import { NotImplementedError, UnauthorizedError } from '@supaglue/core/errors';
import { addLogContext, getCustomerIdPk } from '@supaglue/core/lib';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';

import { getDependencyContainer } from '../../../../dependency_container';

const { connectionService } = getDependencyContainer();

async function salesforceConnectionMiddleware(req: Request, res: Response, next: NextFunction) {
  const externalCustomerId = req.headers['x-customer-id'] as string;
  if (!externalCustomerId) {
    throw new UnauthorizedError('x-customer-id header must be set');
  }
  addLogContext('externalCustomerId', externalCustomerId);
  configureScope((scope) => {
    scope.setTag('externalCustomerId', externalCustomerId);
    scope.setTag('providerName', 'salesforce');
  });

  req.customerId = getCustomerIdPk(req.supaglueApplication.id, externalCustomerId);
  addLogContext('customerId', req.customerId);
  configureScope((scope) => scope.setTag('customerId', req.customerId));

  req.customerConnection = await connectionService.getSafeByCustomerIdAndApplicationIdAndProviderName({
    customerId: req.customerId,
    applicationId: req.supaglueApplication.id,
    providerName: 'salesforce',
  });
  addLogContext('connectionId', req.customerConnection?.id);
  configureScope((scope) => scope.setTag('connectionId', req.customerConnection?.id));

  next();
}

export default function init(app: Router): void {
  const router = Router();
  router.use(salesforceConnectionMiddleware);

  router.get('/accounts', async (req: Request, res: Response) => {
    throw new NotImplementedError('Not implemented');
  });

  router.get('/contacts', async (req: Request, res: Response) => {
    throw new NotImplementedError('Not implemented');
  });

  app.use('/salesforce', router);
}
