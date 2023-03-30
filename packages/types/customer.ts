import { ConnectionSafe } from '../types/connection';

export type BaseCustomer = {
  applicationId: string;
  // Externally provided
  customerId: string;
  name: string;
  email: string;
};

export type Customer = BaseCustomer;

export type CustomerExpandedSafe = Customer & {
  connections: ConnectionSafe[];
};

export type BaseCustomerCreateParams = BaseCustomer;

export type CustomerUpsertParams = BaseCustomerCreateParams;
