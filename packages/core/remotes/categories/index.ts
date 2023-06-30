import { ProviderCategory } from '@supaglue/types/common';
import { CrmRemoteClient } from './crm';
import { EngagementRemoteClient } from './engagement';

export type RemoteClientForProviderCategory<P extends ProviderCategory> = {
  crm: CrmRemoteClient;
  engagement: EngagementRemoteClient;
}[P];
