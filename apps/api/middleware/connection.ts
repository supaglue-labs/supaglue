import { UnauthorizedError } from '@supaglue/core/errors';
import { NextFunction, Request, Response } from 'express';
import { getDependencyContainer } from '../dependency_container';

const { connectionService, integrationService } = getDependencyContainer();

export async function connectionMiddleware(req: any, res: Response, next: NextFunction) {
  req.sg = {
    connectionId: req.params.connection_id,
    ...req.sg,
  };
  next();
}

export async function connectionHeaderMiddleware(req: Request, res: Response, next: NextFunction) {
  const customerId = req.headers['customer-id'] as string;
  const providerName = req.headers['provider-name'] as string;
  if (!customerId || !providerName) {
    throw new UnauthorizedError(`customer-id and provider-name headers must be set`);
  }

  const integration = await integrationService.getByProviderName(providerName);

  req.customerConnection = await connectionService.getByCustomerIdAndIntegrationId({
    customerId,
    integrationId: integration.id,
  });

  next();
}
