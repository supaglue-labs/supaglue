export type SnakecasedCrmTenantFields = {
  _supaglue_application_id: string;
  _supaglue_provider_name: string;
  _supaglue_customer_id: string;
  _supaglue_emitted_at: Date;
  _supaglue_unified_data: Record<string, any>;
};

export type BaseCrmModel = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isDeleted: boolean;
  lastModifiedAt: Date;
  rawData?: Record<string, any>;
};

export type BaseSearchParams = {
  includeRawData?: boolean;
  cursor?: string;
  pageSize?: number;
  associationsToFetch?: string[];
};

export type CrmListParams = {
  includeRawData?: boolean;
  cursor?: string;
  pageSize?: number;
  modifiedAfter?: Date;
  expand?: string[];
  associationsToFetch?: string[];
};

export type CrmGetParams = {
  includeRawData?: boolean;
  expand?: string[];
  associationsToFetch?: string[];
};
