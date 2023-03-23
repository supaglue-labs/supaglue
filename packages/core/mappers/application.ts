import type { Application as ApplicationModel } from '@supaglue/db';
import { ORGANIZATION_ID } from '../lib/constants';
import { Application, ApplicationConfig } from '../types';

export const fromApplicationModel = ({ id, name, config, orgId }: ApplicationModel): Application => {
  return {
    id,
    name,
    config: config as ApplicationConfig,
    orgId: orgId ?? ORGANIZATION_ID,
  };
};
