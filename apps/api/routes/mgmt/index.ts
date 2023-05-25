import { Router } from 'express';
import v1 from './v1';
import v2 from './v2';

export default function init(app: Router): void {
  const mgmtRouter = Router();

  v1(mgmtRouter);
  v2(mgmtRouter);

  app.use('/mgmt', mgmtRouter);
}
