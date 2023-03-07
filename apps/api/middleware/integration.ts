import { NextFunction, Response } from 'express';

export async function integrationMiddleware(req: any, res: Response, next: NextFunction) {
  req.sg = {
    integrationId: req.params.integrationId,
    ...req.sg,
  };
  next();
}
