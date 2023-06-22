type BaseDestinationCreateParams = {
  applicationId: string;
  name: string;
};
type BaseDestination = BaseDestinationCreateParams & {
  id: string;
};
type BaseDestinationUpdateParams = BaseDestination;

export type S3Destination = BaseDestination & {
  type: 's3';
  // TODO(670): encryption
  config: S3Config;
};
export type S3DestinationCreateParams = BaseDestinationCreateParams & {
  type: 's3';
  // TODO(670): encryption
  config: S3Config;
};
export type S3DestinationUpdateParams = BaseDestinationUpdateParams & {
  type: 's3';
  // TODO(670): encryption
  config: S3Config;
};

export type S3Config = {
  region: string; // us-west-2
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export type PostgresDestination = BaseDestination & {
  type: 'postgres';
  config: PostgresConfig;
};
export type PostgresDestinationCreateParams = BaseDestinationCreateParams & {
  type: 'postgres';
  config: PostgresConfig;
};
export type PostgresDestinationUpdateParams = BaseDestinationUpdateParams & {
  type: 'postgres';
  config: PostgresConfig;
};

export type PostgresConfig = {
  host: string;
  port: number;
  database: string;
  schema: string;
  user: string;
  // TODO(670): encrypt
  password: string;
};

export type Destination = S3Destination | PostgresDestination;
export type DestinationCreateParams = S3DestinationCreateParams | PostgresDestinationCreateParams;
export type DestinationTestParams = DestinationCreateParams & {
  id?: string;
};
export type DestinationUpdateParams = S3DestinationUpdateParams | PostgresDestinationUpdateParams;

export type DestinationTestResult = { success: boolean; message: string | null };

export type DestinationConfig = S3Config | PostgresConfig;

export type DestinationType = 's3' | 'postgres';
