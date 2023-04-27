type BaseDestinationCreateParams = {
  applicationId: string;
  name: string;
};
type BaseDestination = BaseDestinationCreateParams & {
  id: string;
  name: string;
};
type BaseDestinationUpdateParams = BaseDestination;

export type S3Destination = BaseDestination & {
  type: 's3';
  config: S3ConfigSafe;
};

export type S3DestinationCreateParams = BaseDestinationCreateParams & {
  type: 's3';
  config: S3ConfigUnsafe;
};

export type S3DestinationUpdateParams = BaseDestinationUpdateParams & {
  type: 's3';
  config: S3ConfigUnsafe;
};

type BaseS3Config = {
  region: string; // us-west-2
  bucket: string;
  accessKeyId: string;
};

export type S3ConfigSafe = BaseS3Config & {
  secretAccessKeyEncrypted: string;
};

export type S3ConfigUnsafe = BaseS3Config & {
  secretAccessKey: string;
};

export type PostgresDestination = BaseDestination & {
  type: 'postgres';
  config: PostgresConfigSafe;
};

export type PostgresDestinationCreateParams = BaseDestinationCreateParams & {
  type: 'postgres';
  config: PostgresConfigUnsafe;
};
export type PostgresDestinationUpdateParams = BaseDestinationUpdateParams & {
  type: 'postgres';
  config: PostgresConfigUnsafe;
};
type BasePostgresConfig = {
  host: string;
  port: number;
  database: string;
  schema: string;
  user: string;
};

export type PostgresConfigSafe = BasePostgresConfig & {
  passwordEncrypted: string;
};

export type PostgresConfigUnsafe = BasePostgresConfig & {
  password: string;
};

export type Destination = S3Destination | PostgresDestination;
export type DestinationCreateParams = S3DestinationCreateParams | PostgresDestinationCreateParams;
export type DestinationUpdateParams = S3DestinationUpdateParams | PostgresDestinationUpdateParams;

export type DestinationConfigUnsafe = S3ConfigUnsafe | PostgresConfigUnsafe;
export type DestinationConfigSafe = S3ConfigSafe | PostgresConfigSafe;

export type DestinationType = 's3' | 'postgres';
