import { NextFunction, Response } from 'express';

export async function customerMiddleware(req: any, res: Response, next: NextFunction) {
  req.sg = {
    customerId: req.params.customer_id,
    ...req.sg,
  };
  next();
}
