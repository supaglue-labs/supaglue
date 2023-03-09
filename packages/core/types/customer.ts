import type { Customer as CustomerModel } from '@supaglue/db';
import { Connection as ConnectionModel } from '@supaglue/db';
import { Connection } from '../types/connection';

export type CustomerModelExpanded = CustomerModel & {
  connections?: ConnectionModel[] | null;
};

export type BaseCustomer = {
  id: string;
  applicationId: string;
  connections?: Connection[];
};

export type Customer = BaseCustomer;

export type BaseCustomerCreateParams = {
  applicationId: string;
};

export type CustomerCreateParams = BaseCustomerCreateParams;
export type CustomerUpdateParams = BaseCustomerCreateParams;
