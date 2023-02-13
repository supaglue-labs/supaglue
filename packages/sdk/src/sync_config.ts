import { InboundSyncConfig, OutboundSyncConfig } from '@supaglue/types';

export function inbound(params: Omit<InboundSyncConfig, 'type'>): InboundSyncConfig {
  return {
    type: 'inbound',
    ...params,
  };
}

export function outbound(params: Omit<OutboundSyncConfig, 'type'>): OutboundSyncConfig {
  return {
    type: 'outbound',
    ...params,
  };
}
