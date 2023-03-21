import { InternalServerError } from '@supaglue/core/errors';

export const getCustomerIdPk = (applicationId: string, externalCustomerId: string): string => {
  return `${applicationId}:${externalCustomerId}`;
};

export const parseCustomerIdPk = (customerIdPk: string): { applicationId: string; externalCustomerId: string } => {
  const split = customerIdPk.split(/:(.*)/s);
  if (split.length < 2) {
    throw new InternalServerError(`Invalid customerId: ${customerIdPk}`);
  }
  return {
    applicationId: split[0],
    externalCustomerId: split[1],
  };
};
