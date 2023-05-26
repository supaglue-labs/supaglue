export type SnakecasedCrmTenantFields = {
  provider_name: string;
  customer_id: string;
};

export type BaseCrmModel = {
  id: string;
  remoteId: string;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
  lastModifiedAt: Date;
  rawData?: Record<string, any>;
};

export type BaseCrmModelV2 = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isDeleted: boolean;
  lastModifiedAt: Date;
  rawData: Record<string, any>;
};
