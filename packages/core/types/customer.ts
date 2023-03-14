import type { Customer as CustomerModel } from '@supaglue/db';
import { Connection as ConnectionModel } from '@supaglue/db';
import { ConnectionUnsafe } from '../types/connection';

export type CustomerModelExpanded = CustomerModel & {
  connections?: ConnectionModel[] | null;
};

export type BaseCustomer = {
  applicationId: string;
  externalIdentifier: string;
  name: string;
  email: string;
};

export type Customer = BaseCustomer & {
  id: string;
  connections?: ConnectionUnsafe[];
};

export type BaseCustomerCreateParams = BaseCustomer;

export type CustomerUpsertParams = BaseCustomerCreateParams;
