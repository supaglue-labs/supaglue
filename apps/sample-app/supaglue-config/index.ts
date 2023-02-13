import * as sdk from '@supaglue/sdk';
// TUTORIAL: uncomment this
// import accountInboundSyncConfig from './inbound/account';
import contactInboundSyncConfig from './inbound/contact';
import leadInboundSyncConfig from './inbound/lead';
import contactOutboundSyncConfig from './outbound/contact';
import opportunityInboundSyncConfig from './realtime-inbound/opportunity';
import credentials from './salesforce_credentials';

sdk.config({
  syncConfigs: [
    contactOutboundSyncConfig,
    contactInboundSyncConfig,
    leadInboundSyncConfig,
    opportunityInboundSyncConfig,
    // TUTORIAL: uncomment this
    // accountInboundSyncConfig,
  ],
  salesforceCredentials: credentials,
});
