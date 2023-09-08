import type { ProviderCategory } from '@supaglue/types/common';
import type { RemoteClient } from '../base';
import type { CrmRemoteClient } from './crm/base';
import type { EngagementRemoteClient } from './engagement/base';
import type { EnrichmentRemoteClient } from './enrichment/base';
import type { MarketingAutomationRemoteClient } from './marketing_automation/base';

export type RemoteClientForProviderCategory<P extends ProviderCategory> = {
  crm: CrmRemoteClient;
  engagement: EngagementRemoteClient;
  enrichment: EnrichmentRemoteClient;
  marketing_automation: MarketingAutomationRemoteClient;
  no_category: RemoteClient;
}[P];
