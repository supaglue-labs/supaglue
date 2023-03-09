import type { Application as ApplicationModel } from '@supaglue/db';
import { Application, ApplicationConfig } from '../types';

export const fromApplicationModel = ({ id, name, config }: ApplicationModel): Application => {
  return {
    id,
    name,
    config: config as ApplicationConfig,
  };
};
