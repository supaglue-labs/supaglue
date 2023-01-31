import { DeveloperConfig as DeveloperConfigModel } from '@prisma/client';
import { DeveloperConfig, DeveloperConfigSpec } from '.';

export const fromModelToDeveloperConfig = (model: DeveloperConfigModel): DeveloperConfig => {
  const spec = model.config as DeveloperConfigSpec;
  return new DeveloperConfig(spec);
};
