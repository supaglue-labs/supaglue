export type SnakecasedEngagementTenantFields = {
  _supaglue_application_id: string;
  _supaglue_provider_name: string;
  _supaglue_customer_id: string;
  _supaglue_emitted_at: Date;
  _supaglue_unified_data: Record<string, any>;
};

export type BaseEngagementModel = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isDeleted: boolean;
  lastModifiedAt: Date;
  rawData: Record<string, any>;
};
