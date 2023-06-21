import { Router } from 'express';
import v2 from './v2';

export default function init(app: Router): void {
  const mgmtRouter = Router();

  v2(mgmtRouter);

  app.use('/mgmt', mgmtRouter);
}
