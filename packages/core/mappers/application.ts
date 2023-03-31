import type { Application as ApplicationModel } from '@supaglue/db';
import { Application, ApplicationConfig } from '@supaglue/types';

export const fromApplicationModel = ({ id, name, config, orgId }: ApplicationModel): Application => {
  return {
    id,
    name,
    config: config as ApplicationConfig,
    orgId,
  };
};
