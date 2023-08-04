import type { Router } from 'express';
import actions from './actions';
import crm from './crm';
import engagement from './engagement';
import internal from './internal';
import metadata from './metadata';
import mgmt from './mgmt';
import oauth from './oauth';

export default function initRoutes(app: Router): void {
  oauth(app);
  mgmt(app);
  engagement(app);
  crm(app);
  metadata(app);
  actions(app);
  internal(app);
}
