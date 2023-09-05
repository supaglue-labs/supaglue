import type { ProviderName } from '@supaglue/types';
import { slugifyForTableName } from '@supaglue/utils';
import fs from 'fs';
import { Pool } from 'pg';

export const getPgPool = (connectionString: string): Pool => {
  // parse the connectionString URL to get the ssl config from the query string
  const parsedConnectionString = new URL(connectionString);
  const caCertPath = parsedConnectionString.searchParams.get('sslcert');
  const sslMode = parsedConnectionString.searchParams.get('sslmode');
  const sslAccept = parsedConnectionString.searchParams.get('sslaccept');
  // delete from the query string so that the connectionString can be passed to the pgPool
  parsedConnectionString.searchParams.delete('sslcert');
  parsedConnectionString.searchParams.delete('sslmode');
  parsedConnectionString.searchParams.delete('sslaccept');
  const ssl =
    sslMode === 'require' || sslMode === 'prefer'
      ? {
          ca: caCertPath ? fs.readFileSync(caCertPath).toString() : undefined,
          rejectUnauthorized: sslAccept === 'strict',
        }
      : undefined;

  return new Pool({
    connectionString: parsedConnectionString.toString(),
    max: 5,
    ssl,
  });
};

export function sanitizeForPostgres(tableName: string): string {
  // Replace dashes with underscores
  let sanitized = tableName.replace(/-/g, '_');

  // Remove characters that are not letters, numbers, or underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');

  // Make sure the table name starts with a letter or an underscore
  if (!sanitized.match(/^[a-zA-Z_]/)) {
    sanitized = '_' + sanitized;
  }

  return sanitized;
}

export const getSchemaName = (applicationId: string) => {
  return sanitizeForPostgres(applicationId);
};

export const getObjectTableName = (providerName: ProviderName, object: string) => {
  const cleanObjectName = slugifyForTableName(object);
  return `${providerName}_${cleanObjectName}`;
};
