import { INTERCOM_STANDARD_OBJECTS } from '@supaglue/utils';
import { BadRequestError } from '../../../errors';

export type IntercomStandardObject = (typeof INTERCOM_STANDARD_OBJECTS)[number];

export const toIntercomStandardObject = (object: string): IntercomStandardObject => {
  if (!INTERCOM_STANDARD_OBJECTS.includes(object as IntercomStandardObject)) {
    throw new BadRequestError(`Unsupported object ${object}`);
  }
  return object as IntercomStandardObject;
};

export const toIntercomEndpoint = (object: IntercomStandardObject): string => {
  if (object === 'company') {
    return '/companies';
  }
  return `/${object}s`;
};
