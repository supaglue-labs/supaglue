export type DestinationType = 's3' | 'postgres' | 'bigquery' | 'mongodb' | 'supaglue';

export type NonSupaglueDestinationType = 's3' | 'postgres' | 'bigquery' | 'mongodb';

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

export type DestinationConfigUnsafe<T extends NonSupaglueDestinationType> = {
  s3: S3ConfigUnsafe;
  postgres: PostgresConfigUnsafe;
  bigquery: BigQueryConfigUnsafe;
  mongodb: MongoDBConfigUnsafe;
}[T];

export type DestinationConfigAtLeastSafe<T extends NonSupaglueDestinationType> = {
  s3: S3ConfigAtLeastSafe;
  postgres: PostgresConfigAtLeastSafe;
  bigquery: BigQueryConfigAtLeastSafe;
  mongodb: MongoDBConfigAtLeastSafe;
}[T];

export type DestinationConfigSafe<T extends NonSupaglueDestinationType> = {
  s3: S3ConfigSafeOnly;
  postgres: PostgresConfigSafeOnly;
  bigquery: BigQueryConfigSafeOnly;
  mongodb: MongoDBConfigSafeOnly;
}[T];

export type DestinationCreateParams<T extends NonSupaglueDestinationType> = BaseDestinationCreateParams & {
  type: T;
  config: DestinationConfigUnsafe<T>;
};

export type DestinationUpdateParams<T extends NonSupaglueDestinationType> = BaseDestinationUpdateParams & {
  type: T;
  config: DestinationConfigAtLeastSafe<T>;
};

export type DestinationUnsafe<T extends NonSupaglueDestinationType> = BaseDestination & {
  type: T;
  config: DestinationConfigUnsafe<T>;
};

export type DestinationSafe<T extends NonSupaglueDestinationType> = BaseDestination & {
  type: T;
  config: DestinationConfigSafe<T>;
};

type SupaglueDestination = {
  id: string;
  applicationId: string;
  type: 'supaglue';
};

type SupaglueDestinationCreateParams = {
  applicationId: string;
  type: 'supaglue';
};

type SupaglueDestinationUpdateParams = SupaglueDestination;

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
  | DestinationUnsafe<'mongodb'>
  | SupaglueDestination;
export type DestinationSafeAny =
  | DestinationSafe<'s3'>
  | DestinationSafe<'postgres'>
  | DestinationSafe<'bigquery'>
  | DestinationSafe<'mongodb'>
  | SupaglueDestination;
export type DestinationCreateParamsAny =
  | DestinationCreateParams<'s3'>
  | DestinationCreateParams<'postgres'>
  | DestinationCreateParams<'bigquery'>
  | DestinationCreateParams<'mongodb'>
  | SupaglueDestinationCreateParams;
export type DestinationUpdateParamsAny =
  | DestinationUpdateParams<'s3'>
  | DestinationUpdateParams<'postgres'>
  | DestinationUpdateParams<'bigquery'>
  | DestinationUpdateParams<'mongodb'>
  | SupaglueDestinationUpdateParams;

export type DestinationTestParams<T extends NonSupaglueDestinationType> =
  | DestinationCreateParams<T>
  | ({
      id: string;
    } & DestinationUpdateParams<T>);

export type DestinationTestParamsAny =
  | DestinationTestParams<'s3'>
  | DestinationTestParams<'postgres'>
  | DestinationTestParams<'bigquery'>
  | DestinationTestParams<'mongodb'>
  | SupaglueDestinationCreateParams
  | SupaglueDestinationUpdateParams;

export type DestinationTestResult = { success: boolean; message: string | null };
