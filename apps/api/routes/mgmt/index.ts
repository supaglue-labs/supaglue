import { Router } from 'express';
import v1 from './v1';

export default function init(app: Router): void {
  const mgmtRouter = Router();

  v1(mgmtRouter);

  app.use('/mgmt', mgmtRouter);
}
