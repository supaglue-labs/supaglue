import type { Customer, Customer as CustomerModel } from '@supaglue/db';

export const fromCustomerModel = ({ id, applicationId, createdAt, updatedAt }: CustomerModel): Customer => {
  return {
    id,
    applicationId,
    createdAt,
    updatedAt,
  } as Customer;
};
