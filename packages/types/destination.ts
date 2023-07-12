export type DestinationType = 's3' | 'postgres' | 'bigquery';

type BaseDestinationCreateParams = {
  applicationId: string;
  name: string;
};
type BaseDestination = BaseDestinationCreateParams & {
  id: string;
};
type BaseDestinationUpdateParams = BaseDestination;

export type DestinationConfigUnsafe<T extends DestinationType> = {
  s3: S3ConfigSafeOnly & S3ConfigUnsafeOnly;
  postgres: PostgresConfigSafeOnly & PostgresConfigUnsafeOnly;
  bigquery: BigQueryConfigSafeOnly & BigQueryConfigUnsafeOnly;
}[T];

export type DestinationConfigSafe<T extends DestinationType> = {
  s3: S3ConfigSafeOnly;
  postgres: PostgresConfigSafeOnly;
  bigquery: BigQueryConfigSafeOnly;
}[T];

export type DestinationCreateParams<T extends DestinationType> = BaseDestinationCreateParams & {
  type: T;
  config: DestinationConfigUnsafe<T>;
};

export type DestinationUpdateParams<T extends DestinationType> = BaseDestinationUpdateParams & {
  type: T;
  config: DestinationConfigUnsafe<T>;
};

export type DestinationUnsafe<T extends DestinationType> = BaseDestination & {
  type: T;
  config: DestinationConfigUnsafe<T>;
};

export type DestinationSafe<T extends DestinationType> = BaseDestination & {
  type: T;
  config: DestinationConfigSafe<T>;
};

export type S3ConfigSafeOnly = {
  region: string; // us-west-2
  bucket: string;
  accessKeyId: string;
};

// TODO(670): encrypt
export type S3ConfigUnsafeOnly = {
  secretAccessKey: string;
};

export type PostgresConfigSafeOnly = {
  host: string;
  port: number;
  database: string;
  schema: string;
  user: string;
};

// TODO(670): encrypt
export type PostgresConfigUnsafeOnly = {
  password: string;
};

export type BigQueryConfigSafeOnly = {
  projectId: string;
  dataset: string;
  credentials: {
    clientEmail: string;
  };
};

// TODO (670): encrypt
export type BigQueryConfigUnsafeOnly = {
  credentials: {
    privateKey: string;
  };
};

export type DestinationUnsafeAny =
  | DestinationUnsafe<'s3'>
  | DestinationUnsafe<'postgres'>
  | DestinationUnsafe<'bigquery'>;
export type DestinationSafeAny = DestinationSafe<'s3'> | DestinationSafe<'postgres'> | DestinationSafe<'bigquery'>;
export type DestinationCreateParamsAny =
  | DestinationCreateParams<'s3'>
  | DestinationCreateParams<'postgres'>
  | DestinationCreateParams<'bigquery'>;
export type DestinationUpdateParamsAny =
  | DestinationUpdateParams<'s3'>
  | DestinationUpdateParams<'postgres'>
  | DestinationUpdateParams<'bigquery'>;

export type DestinationTestParams<T extends DestinationType> = DestinationCreateParams<T> & {
  id?: string;
};

export type DestinationTestParamsAny =
  | DestinationTestParams<'s3'>
  | DestinationTestParams<'postgres'>
  | DestinationTestParams<'bigquery'>;

export type DestinationTestResult = { success: boolean; message: string | null };
