export type DestinationType = 'postgres' | 'bigquery' | 'snowflake' | 'redshift' | 'supaglue';

export type NonSupaglueDestinationType = 'postgres' | 'bigquery' | 'snowflake' | 'redshift';

type BaseDestinationCreateParams = {
  applicationId: string;
  name: string;
};
type BaseDestination = BaseDestinationCreateParams & {
  id: string;
  version: number;
};
type BaseDestinationUpdateParams = BaseDestination;

export type DestinationConfigUnsafeAny =
  | DestinationConfigUnsafe<'postgres'>
  | DestinationConfigUnsafe<'bigquery'>
  | DestinationConfigUnsafe<'snowflake'>
  | DestinationConfigUnsafe<'redshift'>;

export type DestinationConfigUnsafe<T extends NonSupaglueDestinationType> = {
  postgres: PostgresConfigUnsafe;
  bigquery: BigQueryConfigUnsafe;
  snowflake: SnowflakeConfigUnsafe;
  redshift: RedshiftConfigUnsafe;
}[T];

export type DestinationConfigAtLeastSafe<T extends NonSupaglueDestinationType> = {
  postgres: PostgresConfigAtLeastSafe;
  bigquery: BigQueryConfigAtLeastSafe;
  snowflake: SnowflakeConfigAtLeastSafe;
  redshift: RedshiftConfigAtLeastSafe;
}[T];

export type DestinationConfigSafe<T extends NonSupaglueDestinationType> = {
  postgres: PostgresConfigSafeOnly;
  bigquery: BigQueryConfigSafeOnly;
  snowflake: SnowflakeConfigSafeOnly;
  redshift: RedshiftConfigSafeOnly;
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
  version: number;
};

type SupaglueDestinationCreateParams = {
  applicationId: string;
  type: 'supaglue';
};

type SupaglueDestinationUpdateParams = SupaglueDestination;

export type PostgresConfigUnsafe = PostgresConfigSafeOnly & PostgresConfigUnsafeOnly;
export type PostgresConfigAtLeastSafe = PostgresConfigSafeOnly & Partial<PostgresConfigUnsafeOnly>;

export type PostgresConfigSafeOnly = {
  host: string;
  port: number;
  database: string;
  schema: string;
  user: string;
  sslMode?: 'disable' | 'no-verify' | 'prefer' | 'require' | 'verify-ca' | 'verify-full';
};

export type PostgresConfigUnsafeOnly = {
  password: string;
  serverCaCert?: string;
  clientCert?: string;
  clientKey?: string;
  serverName?: string;
};

export type RedshiftConfigUnsafe = RedshiftConfigSafeOnly & RedshiftConfigUnsafeOnly;
export type RedshiftConfigAtLeastSafe = RedshiftConfigSafeOnly & Partial<RedshiftConfigUnsafeOnly>;

export type SnowflakeConfigUnsafe = SnowflakeConfigSafeOnly & SnowflakeConfigUnsafeOnly;
export type SnowflakeConfigAtLeastSafe = SnowflakeConfigSafeOnly & Partial<SnowflakeConfigUnsafeOnly>;

export type BigQueryConfigUnsafe = BigQueryConfigSafeOnly & BigQueryConfigUnsafeOnly;
export type BigQueryConfigAtLeastSafe = BigQueryConfigSafeOnly & Partial<BigQueryConfigUnsafeOnly>;

export type RedshiftConfigSafeOnly = {
  host: string;
  port: number;
  username: string;
  database: string;
  schema: string;
  uploadMethod: string;
  s3KeyId: string;
  s3BucketName: string;
  s3BucketRegion: string;
};

export type RedshiftConfigUnsafeOnly = {
  s3AccessKey: string;
};

export type SnowflakeConfigSafeOnly = {
  host: string;
  role: string;
  warehouse: string;
  database: string;
  schema: string;
  username: string;
};

export type SnowflakeConfigUnsafeOnly = {
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
  | DestinationUnsafe<'postgres'>
  | DestinationUnsafe<'bigquery'>
  | DestinationUnsafe<'snowflake'>
  | DestinationUnsafe<'redshift'>
  | SupaglueDestination;
export type DestinationSafeAny =
  | DestinationSafe<'postgres'>
  | DestinationSafe<'bigquery'>
  | DestinationSafe<'snowflake'>
  | DestinationSafe<'redshift'>
  | SupaglueDestination;
export type DestinationCreateParamsAny =
  | DestinationCreateParams<'postgres'>
  | DestinationCreateParams<'bigquery'>
  | DestinationCreateParams<'snowflake'>
  | DestinationCreateParams<'redshift'>
  | SupaglueDestinationCreateParams;
export type DestinationUpdateParamsAny =
  | DestinationUpdateParams<'postgres'>
  | DestinationUpdateParams<'bigquery'>
  | DestinationUpdateParams<'snowflake'>
  | DestinationUpdateParams<'redshift'>
  | SupaglueDestinationUpdateParams;

export type DestinationTestParams<T extends NonSupaglueDestinationType> =
  | DestinationCreateParams<T>
  | ({
      id: string;
    } & DestinationUpdateParams<T>);

export type DestinationTestParamsAny =
  | DestinationTestParams<'postgres'>
  | DestinationTestParams<'bigquery'>
  | DestinationTestParams<'snowflake'>
  | DestinationTestParams<'redshift'>
  | SupaglueDestinationCreateParams
  | SupaglueDestinationUpdateParams;

export type DestinationTestResult = { success: boolean; message: string | null };
