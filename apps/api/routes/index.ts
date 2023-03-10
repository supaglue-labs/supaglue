import { Router } from 'express';
import crm from './crm';
import mgmt from './mgmt';
import oauth from './oauth';

export default function initRoutes(app: Router): void {
  oauth(app);
  mgmt(app);
  crm(app);
}
