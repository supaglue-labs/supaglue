import { NextFunction, Response } from 'express';

export async function integrationMiddleware(req: any, res: Response, next: NextFunction) {
  req.sg = {
    integrationId: req.params.integration_id,
    ...req.sg,
  };
  next();
}
