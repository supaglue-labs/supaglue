import { InternalServerError } from '@supaglue/core/errors';

export const getCustomerId = (applicationId: string, externalCustomerId: string): string => {
  return `${applicationId}:${externalCustomerId}`;
};

export const parseCustomerId = (customerId: string): { applicationId: string; externalCustomerId: string } => {
  const split = customerId.split(/:(.*)/s);
  if (split.length < 2) {
    throw new InternalServerError(`Invalid customerId: ${customerId}`);
  }
  return {
    applicationId: split[0],
    externalCustomerId: split[1],
  };
};
