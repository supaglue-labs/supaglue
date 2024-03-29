import type { Router } from 'express';
import actions from './actions';
import crm from './crm';
import data from './data';
import engagement from './engagement';
import enrichment from './enrichment';
import internal from './internal';
import marketingAutomation from './marketing-automation';
import metadata from './metadata';
import mgmt from './mgmt';
import oauth from './oauth';
import privateRoutes from './private';

export default function initRoutes(app: Router): void {
  oauth(app);
  mgmt(app);
  engagement(app);
  crm(app);
  enrichment(app);
  metadata(app);
  actions(app);
  internal(app);
  privateRoutes(app);
  data(app);
  marketingAutomation(app);
}
