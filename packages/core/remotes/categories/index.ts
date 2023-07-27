import type { ProviderCategory } from '@supaglue/types/common';
import type { RemoteClient } from '../base';
import type { CrmRemoteClient } from './crm/base';
import type { EngagementRemoteClient } from './engagement/base';

export type RemoteClientForProviderCategory<P extends ProviderCategory> = {
  crm: CrmRemoteClient;
  engagement: EngagementRemoteClient;
  no_category: RemoteClient;
}[P];
