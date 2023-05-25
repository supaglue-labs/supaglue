import { Router } from 'express';
import v1 from './v1';
import v2 from './v2';

export default function init(app: Router): void {
  const internalRouter = Router();

  v1(internalRouter);
  v2(internalRouter);

  app.use('/internal', internalRouter);
}
