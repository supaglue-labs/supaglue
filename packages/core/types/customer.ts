import type { Customer as CustomerModel } from '@supaglue/db';
import { Connection as ConnectionModel } from '@supaglue/db';
import { ConnectionSafe } from '../types/connection';

export type CustomerModelExpanded = CustomerModel & {
  connections?: ConnectionModel[] | null;
};

export type BaseCustomer = {
  applicationId: string;
  customerId: string;
  name: string;
  email: string;
};

export type Customer = BaseCustomer & {
  id: string;
};

export type CustomerExpandedSafe = Customer & {
  connections: ConnectionSafe[];
};

export type BaseCustomerCreateParams = BaseCustomer;

export type CustomerUpsertParams = BaseCustomerCreateParams;
