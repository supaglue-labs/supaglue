import type { CRMCommonModel } from './crm';

export type ListParams = GetParams &
  PaginationParams & {
    created_after?: string;
    created_before?: string;
    updated_after?: string;
    updated_before?: string;
  };

type PaginationParams = {
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
