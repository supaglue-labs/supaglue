import * as sdk from '@supaglue/sdk';
import accountSyncConfig from './account';
import contactSyncConfig from './contact';
import leadSyncConfig from './lead';
import opportunitySyncConfig from './opportunity';
import credentials from './salesforce_credentials';

sdk.config({
  syncConfigs: [contactSyncConfig, leadSyncConfig, opportunitySyncConfig, accountSyncConfig],
  salesforceCredentials: credentials,
});
