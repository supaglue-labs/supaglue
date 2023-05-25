export type BaseCrmModel = {
  remoteId: string;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

export type BaseCrmModelV2 = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isDeleted: boolean;
  lastModifiedAt: Date;
  rawData: Record<string, any>;
};

export type BaseCrmModelNonRemoteParams = {
  id: string;
  lastModifiedAt: Date;
};

export type BaseCrmModelRemoteOnlyParams = {
  deletedAt: Date | null;
  detectedOrDeletedAt: Date | null;
};
