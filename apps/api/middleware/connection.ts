import { UnauthorizedError } from '@supaglue/core/errors';
import { NextFunction, Request, Response } from 'express';
import { getDependencyContainer } from '../dependency_container';

const { customerService, connectionService, integrationService } = getDependencyContainer();

export async function connectionHeaderMiddleware(req: Request, res: Response, next: NextFunction) {
  const externalCustomerId = req.headers['x-customer-id'] as string;
  const providerName = req.headers['x-provider-name'] as string;
  if (!externalCustomerId || !providerName) {
    throw new UnauthorizedError(`x-customer-id and x-provider-name headers must be set`);
  }

  const customer = await customerService.getByExternalId(req.supaglueApplication.id, externalCustomerId);

  const integration = await integrationService.getByProviderName(providerName);

  req.customerConnection = await connectionService.getSafeByCustomerIdAndIntegrationId({
    customerId: customer.id,
    integrationId: integration.id,
  });

  next();
}
