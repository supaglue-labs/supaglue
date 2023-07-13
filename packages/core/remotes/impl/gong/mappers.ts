import { BadRequestError } from '../../../errors';

export const gongStandardObjects = ['call', 'callDetail', 'callTranscript'] as const;
export type GongStandardObject = (typeof gongStandardObjects)[number];

export const toGongStandardObject = (object: string): GongStandardObject => {
  if (!gongStandardObjects.includes(object as GongStandardObject)) {
    throw new BadRequestError(`Unsupported object ${object}`);
  }
  return object as GongStandardObject;
};
