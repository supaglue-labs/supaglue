import { UnauthorizedError } from '@supaglue/core/errors';
import { NextFunction, Request, Response } from 'express';
import { getDependencyContainer } from '../dependency_container';

const { connectionService, integrationService } = getDependencyContainer();

export async function connectionHeaderMiddleware(req: Request, res: Response, next: NextFunction) {
  const customerId = req.headers['x-customer-id'] as string;
  const providerName = req.headers['x-provider-name'] as string;
  if (!customerId || !providerName) {
    throw new UnauthorizedError(`x-customer-id and x-provider-name headers must be set`);
  }

  const integration = await integrationService.getByProviderName(providerName);

  req.customerConnection = await connectionService.getSafeByCustomerIdAndIntegrationId({
    customerId,
    integrationId: integration.id,
  });

  next();
}
