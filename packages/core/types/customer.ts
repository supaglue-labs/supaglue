import type { Customer as CustomerModel } from '@supaglue/db';
import { Connection as ConnectionModel } from '@supaglue/db';

export type CustomerModelExpanded = CustomerModel & {
  connections?: ConnectionModel[] | null;
};
