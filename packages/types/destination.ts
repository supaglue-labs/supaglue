export type DestinationType = 's3' | 'postgres' | 'bigquery' | 'mongodb';

type BaseDestinationCreateParams = {
  applicationId: string;
  name: string;
};
type BaseDestination = BaseDestinationCreateParams & {
  id: string;
};
type BaseDestinationUpdateParams = BaseDestination;

export type DestinationConfigUnsafeAny =
  | DestinationConfigUnsafe<'s3'>
  | DestinationConfigUnsafe<'postgres'>
  | DestinationConfigUnsafe<'bigquery'>
  | DestinationConfigUnsafe<'mongodb'>;

export type DestinationConfigUnsafe<T extends DestinationType> = {
  s3: S3ConfigUnsafe;
  postgres: PostgresConfigUnsafe;
  bigquery: BigQueryConfigUnsafe;
  mongodb: MongoDBConfigUnsafe;
}[T];

export type DestinationConfigAtLeastSafe<T extends DestinationType> = {
  s3: S3ConfigAtLeastSafe;
  postgres: PostgresConfigAtLeastSafe;
  bigquery: BigQueryConfigAtLeastSafe;
  mongodb: MongoDBConfigAtLeastSafe;
}[T];

export type DestinationConfigSafe<T extends DestinationType> = {
  s3: S3ConfigSafeOnly;
  postgres: PostgresConfigSafeOnly;
  bigquery: BigQueryConfigSafeOnly;
  mongodb: MongoDBConfigSafeOnly;
}[T];

export type DestinationCreateParams<T extends DestinationType> = BaseDestinationCreateParams & {
  type: T;
  config: DestinationConfigUnsafe<T>;
};

export type DestinationUpdateParams<T extends DestinationType> = BaseDestinationUpdateParams & {
  type: T;
  config: DestinationConfigAtLeastSafe<T>;
};

export type DestinationUnsafe<T extends DestinationType> = BaseDestination & {
  type: T;
  config: DestinationConfigUnsafe<T>;
};

export type DestinationSafe<T extends DestinationType> = BaseDestination & {
  type: T;
  config: DestinationConfigSafe<T>;
};

export type S3ConfigUnsafe = S3ConfigSafeOnly & S3ConfigUnsafeOnly;
export type S3ConfigAtLeastSafe = S3ConfigSafeOnly & Partial<S3ConfigUnsafeOnly>;

export type S3ConfigSafeOnly = {
  region: string; // us-west-2
  bucket: string;
  accessKeyId: string;
};

// TODO(670): encrypt
export type S3ConfigUnsafeOnly = {
  secretAccessKey: string;
};

export type PostgresConfigUnsafe = PostgresConfigSafeOnly & PostgresConfigUnsafeOnly;
export type PostgresConfigAtLeastSafe = PostgresConfigSafeOnly & Partial<PostgresConfigUnsafeOnly>;

export type PostgresConfigSafeOnly = {
  host: string;
  port: number;
  database: string;
  schema: string;
  user: string;
  // TODO: support more options
  sslMode?: 'disable' | 'allow' | 'prefer' | 'require';
};

// TODO(670): encrypt
export type PostgresConfigUnsafeOnly = {
  password: string;
};

export type BigQueryConfigUnsafe = BigQueryConfigSafeOnly & BigQueryConfigUnsafeOnly;
export type BigQueryConfigAtLeastSafe = BigQueryConfigSafeOnly & Partial<BigQueryConfigUnsafeOnly>;

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

export type MongoDBConfigUnsafe = MongoDBConfigSafeOnly & MongoDBConfigUnsafeOnly;
export type MongoDBConfigAtLeastSafe = MongoDBConfigSafeOnly & Partial<MongoDBConfigUnsafeOnly>;

export type MongoDBConfigSafeOnly = {
  host: string;
  database: string;
  user: string;
};

// TODO (670): encrypt
export type MongoDBConfigUnsafeOnly = {
  password: string;
};

export type DestinationUnsafeAny =
  | DestinationUnsafe<'s3'>
  | DestinationUnsafe<'postgres'>
  | DestinationUnsafe<'bigquery'>
  | DestinationUnsafe<'mongodb'>;
export type DestinationSafeAny =
  | DestinationSafe<'s3'>
  | DestinationSafe<'postgres'>
  | DestinationSafe<'bigquery'>
  | DestinationSafe<'mongodb'>;
export type DestinationCreateParamsAny =
  | DestinationCreateParams<'s3'>
  | DestinationCreateParams<'postgres'>
  | DestinationCreateParams<'bigquery'>
  | DestinationCreateParams<'mongodb'>;
export type DestinationUpdateParamsAny =
  | DestinationUpdateParams<'s3'>
  | DestinationUpdateParams<'postgres'>
  | DestinationUpdateParams<'bigquery'>
  | DestinationUpdateParams<'mongodb'>;

export type DestinationTestParams<T extends DestinationType> =
  | DestinationCreateParams<T>
  | ({
      id: string;
    } & DestinationUpdateParams<T>);

export type DestinationTestParamsAny =
  | DestinationTestParams<'s3'>
  | DestinationTestParams<'postgres'>
  | DestinationTestParams<'bigquery'>
  | DestinationTestParams<'mongodb'>;

export type DestinationTestResult = { success: boolean; message: string | null };
