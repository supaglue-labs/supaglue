import type { Application as ApplicationModel } from '@supaglue/db';
import type { Application, ApplicationConfig } from '@supaglue/types';

export const fromApplicationModel = ({
  id,
  name,
  environment,
  config,
  orgId,
  email,
}: ApplicationModel): Application => {
  return {
    id,
    name,
    environment,
    config: config as ApplicationConfig,
    orgId,
    email,
  };
};
