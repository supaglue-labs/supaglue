import * as sdk from '@supaglue/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env` });

const credentials = sdk.internal.common.postgres.credentials({
  host: 'postgres',
  port: 5432,
  database: 'sample_app',
  user: process.env.CONFIG_DB_USER ?? '',
  password: process.env.CONFIG_DB_PASSWORD ?? '',
});

export default credentials;
