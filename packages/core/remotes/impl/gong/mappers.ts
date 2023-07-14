import { GONG_STANDARD_OBJECTS } from '@supaglue/utils';
import { BadRequestError } from '../../../errors';

export type GongStandardObject = (typeof GONG_STANDARD_OBJECTS)[number];

export const toGongStandardObject = (object: string): GongStandardObject => {
  if (!GONG_STANDARD_OBJECTS.includes(object as GongStandardObject)) {
    throw new BadRequestError(`Unsupported object ${object}`);
  }
  return object as GongStandardObject;
};
