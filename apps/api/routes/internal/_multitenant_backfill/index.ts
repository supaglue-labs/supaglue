import { Router } from 'express';

export default function init(app: Router): void {
  const systemRouter = Router();
  app.use('/_multitenant_backfill', systemRouter);
}
