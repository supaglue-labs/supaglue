export type DestinationType = 'postgres' | 'bigquery' | 'supaglue';

export type NonSupaglueDestinationType = 'postgres' | 'bigquery';

type BaseDestinationCreateParams = {
  applicationId: string;
  name: string;
};
type BaseDestination = BaseDestinationCreateParams & {
  id: string;
  version: number;
};
type BaseDestinationUpdateParams = BaseDestination;

export type DestinationConfigUnsafeAny = DestinationConfigUnsafe<'postgres'> | DestinationConfigUnsafe<'bigquery'>;

export type DestinationConfigUnsafe<T extends NonSupaglueDestinationType> = {
  postgres: PostgresConfigUnsafe;
  bigquery: BigQueryConfigUnsafe;
}[T];

export type DestinationConfigAtLeastSafe<T extends NonSupaglueDestinationType> = {
  postgres: PostgresConfigAtLeastSafe;
  bigquery: BigQueryConfigAtLeastSafe;
}[T];

export type DestinationConfigSafe<T extends NonSupaglueDestinationType> = {
  postgres: PostgresConfigSafeOnly;
  bigquery: BigQueryConfigSafeOnly;
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

export type DestinationUnsafeAny = DestinationUnsafe<'postgres'> | DestinationUnsafe<'bigquery'> | SupaglueDestination;
export type DestinationSafeAny = DestinationSafe<'postgres'> | DestinationSafe<'bigquery'> | SupaglueDestination;
export type DestinationCreateParamsAny =
  | DestinationCreateParams<'postgres'>
  | DestinationCreateParams<'bigquery'>
  | SupaglueDestinationCreateParams;
export type DestinationUpdateParamsAny =
  | DestinationUpdateParams<'postgres'>
  | DestinationUpdateParams<'bigquery'>
  | SupaglueDestinationUpdateParams;

export type DestinationTestParams<T extends NonSupaglueDestinationType> =
  | DestinationCreateParams<T>
  | ({
      id: string;
    } & DestinationUpdateParams<T>);

export type DestinationTestParamsAny =
  | DestinationTestParams<'postgres'>
  | DestinationTestParams<'bigquery'>
  | SupaglueDestinationCreateParams
  | SupaglueDestinationUpdateParams;

export type DestinationTestResult = { success: boolean; message: string | null };
