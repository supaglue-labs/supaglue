import type { CRMCommonModel } from './crm';

export type ListParams = GetParams &
  PaginationParams & {
    include_deleted_data?: boolean;
    created_after?: string;
    created_before?: string;
    modified_after?: string;
    modified_before?: string;
  };

export type PaginationParams = {
  cursor?: string;
  page_size?: string;
};

export type GetParams = {
  expand?: string;
};

export type PaginatedResult<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};

export type IntegrationCategory = 'crm';
export type CommonModel = CRMCommonModel;
