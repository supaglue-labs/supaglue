import type { Connection as ConnectionModel, Customer as CustomerModel } from '@supaglue/db';

export type CustomerModelExpanded = CustomerModel & {
  connections?: ConnectionModel[] | null;
};
