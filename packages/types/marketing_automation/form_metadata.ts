export type FormMetadata = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  rawData?: Record<string, unknown>;
};
