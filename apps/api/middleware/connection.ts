import { UnauthorizedError } from '@supaglue/core/errors';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { NextFunction, Request, Response } from 'express';
import { getDependencyContainer } from '../dependency_container';

const { connectionService, integrationService } = getDependencyContainer();

export async function connectionHeaderMiddleware(req: Request, res: Response, next: NextFunction) {
  const externalCustomerId = req.headers['x-customer-id'] as string;
  const providerName = req.headers['x-provider-name'] as string;
  if (!externalCustomerId || !providerName) {
    throw new UnauthorizedError('x-customer-id and x-provider-name headers must be set');
  }

  const customerId = getCustomerIdPk(req.supaglueApplication.id, externalCustomerId);

  // TODO: Need to make integration unique on (providerName, applicationId)
  // TODO: Then, the look up by applicationId here will check for authorization.
  const integration = await integrationService.getByProviderName(providerName);

  req.customerConnection = await connectionService.getSafeByCustomerIdAndIntegrationId({
    customerId,
    integrationId: integration.id,
  });

  next();
}
