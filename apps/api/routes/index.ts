import { Router } from 'express';
import crm from './crm';
import internal from './internal';
import mgmt from './mgmt';
import oauth from './oauth';

export default function initRoutes(app: Router): void {
  oauth(app);
  mgmt(app);
  crm(app);
  internal(app);
}
