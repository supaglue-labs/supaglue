import { Router } from 'express';
import v1 from './v1';

export default function init(app: Router): void {
  const internalRouter = Router();

  v1(internalRouter);

  app.use('/internal', internalRouter);
}
