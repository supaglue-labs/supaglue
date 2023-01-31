import * as sdk from '@supaglue/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../.env` });

const credentials = sdk.salesforce.salesforceCredentials({
  loginUrl: process.env.SALESFORCE_URL ?? '',
  clientId: process.env.SALESFORCE_KEY ?? '',
  clientSecret: process.env.SALESFORCE_SECRET ?? '',
});

export default credentials;
