import { DeveloperConfig as DeveloperConfigModel } from '@prisma/client';
import { DeveloperConfigSpec } from '@supaglue/types';
import { DeveloperConfig } from '.';

export const fromModelToDeveloperConfig = (model: DeveloperConfigModel): DeveloperConfig => {
  const spec = model.config as DeveloperConfigSpec;
  return new DeveloperConfig(spec);
};
