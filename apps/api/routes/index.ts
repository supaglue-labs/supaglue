import type { Router } from 'express';
import crm from './crm';
import engagement from './engagement';
import internal from './internal';
import mgmt from './mgmt';
import oauth from './oauth';

export default function initRoutes(app: Router): void {
  oauth(app);
  mgmt(app);
  engagement(app);
  crm(app);
  internal(app);
}
