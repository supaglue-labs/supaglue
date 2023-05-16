import { UnauthorizedError } from '@supaglue/core/errors';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { addLogContext } from '@supaglue/core/lib/logger';
import { NextFunction, Request, Response } from 'express';
import { getDependencyContainer } from '../dependency_container';

const { connectionService } = getDependencyContainer();

export async function connectionHeaderMiddleware(req: Request, res: Response, next: NextFunction) {
  const externalCustomerId = req.headers['x-customer-id'] as string;
  const providerName = req.headers['x-provider-name'] as string;
  if (!externalCustomerId || !providerName) {
    throw new UnauthorizedError('x-customer-id and x-provider-name headers must be set');
  }
  addLogContext('externalCustomerId', externalCustomerId);
  addLogContext('providerName', providerName);

  req.customerId = getCustomerIdPk(req.supaglueApplication.id, externalCustomerId);
  addLogContext('customerId', req.customerId);

  req.customerConnection = await connectionService.getSafeByCustomerIdAndApplicationIdAndProviderName({
    customerId: req.customerId,
    applicationId: req.supaglueApplication.id,
    providerName,
  });
  addLogContext('connectionId', req.customerConnection?.id);

  next();
}
