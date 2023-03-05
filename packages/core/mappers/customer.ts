import type { Customer, Customer as CustomerModel } from '@supaglue/db';

export const fromCustomerModel = ({ id, createdAt, updatedAt }: CustomerModel): Customer => {
  return {
    id,
    createdAt,
    updatedAt,
  } as Customer;
};
