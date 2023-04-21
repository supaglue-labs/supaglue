export type BaseCrmModel = {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  wasDeleted: boolean;

  deletedAt: Date | null;

  lastModifiedAt: Date;
};
