import * as sdk from '@supaglue/sdk';
// TUTORIAL: uncomment this
// import accountInboundSyncConfig from './inbound/account';
import contactInboundSyncConfig from './inbound/contact';
import leadInboundSyncConfig from './inbound/lead';
import opportunityInboundSyncConfig from './inbound/opportunity';
import contactOutboundSyncConfig from './outbound/contact';
import credentials from './salesforce_credentials';

sdk.config({
  syncConfigs: [
    contactInboundSyncConfig,
    contactOutboundSyncConfig,
    leadInboundSyncConfig,
    opportunityInboundSyncConfig,
    // TUTORIAL: uncomment this
    // accountInboundSyncConfig,
  ],
  salesforceCredentials: credentials,
});
