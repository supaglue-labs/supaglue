import type { CRMCommonModelType } from './crm';
import { EngagementCommonModelType } from './engagement';

export type ListParams = GetParams &
  PaginationParams & {
    include_deleted_data?: string; // we need this to be string because the query param is not coerced to boolean
    created_after?: string;
    created_before?: string;
    modified_after?: string;
    modified_before?: string;
  };

export type ListInternalParams = GetInternalParams &
  PaginationInternalParams & {
    include_deleted_data?: boolean;
    created_after?: string;
    created_before?: string;
    modified_after?: string;
    modified_before?: string;
  };

export type GetParams = {
  include_raw_data?: string;
};

export type GetInternalParams = {
  include_raw_data?: boolean;
};

export type SearchParams = GetParams & PaginationParams;
export type SearchInternalParams = GetInternalParams & PaginationInternalParams;

export type PaginationParams = {
  cursor?: string;
  page_size?: string; // we need this to be string because the query param is not coerced to boolean
};

export type PaginationInternalParams = {
  cursor?: string;
  page_size: number;
};

export type PaginatedResult<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};

export type IntegrationCategory = 'crm' | 'engagement';
export type CommonModelType = CRMCommonModelType | EngagementCommonModelType;
