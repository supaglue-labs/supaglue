import * as sdk from '@supaglue/sdk';
import accountSyncConfig from './account';
// TUTORIAL: uncomment this
// import contactSyncConfig from './contact';
import leadSyncConfig from './lead';
import opportunitySyncConfig from './opportunity';
import credentials from './salesforce_credentials';

sdk.config({
  syncConfigs: [
    // TUTORIAL: uncomment this
    //contactSyncConfig,
    leadSyncConfig,
    opportunitySyncConfig,
    accountSyncConfig,
  ],
  salesforceCredentials: credentials,
});
