import { Router } from 'express';
import v1 from './v1';

export default function init(app: Router): void {
  const crmRouter = Router();

  v1(crmRouter);

  app.use('/crm', crmRouter);
}
