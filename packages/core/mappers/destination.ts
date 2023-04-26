import type { Destination as DestinationModel } from '@supaglue/db';
import { Destination, PostgresConfigSafe, PostgresConfigUnsafe, S3ConfigSafe, S3ConfigUnsafe } from '@supaglue/types';
import { encryptAsString } from '../lib';

export const fromDestinationModel = (model: DestinationModel): Destination => {
  return {
    id: model.id,
    name: model.name,
    type: model.type,
    applicationId: model.applicationId,
    config: model.config,
  } as Destination; // TODO: better type safety?
};

export const toPostgresDestinationConfigSafe = async ({
  host,
  port,
  database,
  schema,
  user,
  password,
}: PostgresConfigUnsafe): Promise<PostgresConfigSafe> => {
  return {
    host,
    port,
    database,
    schema,
    user,
    passwordEncrypted: await encryptAsString(password),
  };
};

export const toS3DestinationConfigSafe = async ({
  region,
  bucket,
  accessKeyId,
  secretAccessKey,
}: S3ConfigUnsafe): Promise<S3ConfigSafe> => {
  return {
    region,
    bucket,
    accessKeyId,
    secretAccessKeyEncrypted: await encryptAsString(secretAccessKey),
  };
};
