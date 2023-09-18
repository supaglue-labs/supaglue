import type { CRMCommonObjectType, CRMCommonObjectTypeMap } from './crm';
import type { EngagementCommonObjectType, EngagementCommonObjectTypeMap } from './engagement';

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
  totalCount: number;
};

export type ProviderCategory = 'crm' | 'engagement' | 'enrichment' | 'marketing_automation' | 'no_category';
export type CommonObjectType = CRMCommonObjectType | EngagementCommonObjectType;
export type CommonObjectTypeForCategory<P extends ProviderCategory> = {
  crm: CRMCommonObjectType;
  engagement: EngagementCommonObjectType;
  enrichment: null;
  marketing_automation: never; // TODO maybe should be null?
  no_category: null;
}[P];

export type CommonObjectTypeMapForCategory<P extends ProviderCategory> = {
  crm: CRMCommonObjectTypeMap<CRMCommonObjectType>;
  engagement: EngagementCommonObjectTypeMap<EngagementCommonObjectType>;
  enrichment: Record<string, never>;
  marketing_automation: Record<string, never>;
  no_category: Record<string, never>;
}[P];
