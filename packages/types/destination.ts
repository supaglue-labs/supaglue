type BaseDestinationCreateParams = {
  applicationId: string;
};
type BaseDestination = BaseDestinationCreateParams & {
  id: string;
};
type BaseDestinationUpdateParams = BaseDestination;

export type S3Destination = BaseDestination & {
  type: 's3';
  // TODO: encryption
  config: {
    region: string; // us-west-2
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
};
export type S3DestinationCreateParams = BaseDestinationCreateParams & {
  type: 's3';
  // TODO: encryption
  config: {
    region: string; // us-west-2
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
};
export type S3DestinationUpdateParams = BaseDestinationUpdateParams & {
  type: 's3';
  // TODO: encryption
  config: {
    region: string; // us-west-2
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
};

export type PostgresDestination = BaseDestination & {
  type: 'postgres';
  config: object; // TODO: define this
};
export type PostgresDestinationCreateParams = BaseDestinationCreateParams & {
  type: 'postgres';
  config: object; // TODO: define this
};
export type PostgresDestinationUpdateParams = BaseDestinationUpdateParams & {
  type: 'postgres';
  config: object; // TODO: define this
};

export type Destination = S3Destination | PostgresDestination;
export type DestinationCreateParams = S3DestinationCreateParams | PostgresDestinationCreateParams;
export type DestinationUpdateParams = S3DestinationUpdateParams | PostgresDestinationUpdateParams;

export type DestinationType = 's3' | 'postgres';
