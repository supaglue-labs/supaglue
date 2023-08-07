import type { MagicLink as MagicLinkModel } from '@supaglue/db';
import type { MagicLink, ProviderName } from '@supaglue/types';

export function fromMagicLinkModel({
  id,
  applicationId,
  authType,
  customerId,
  providerId,
  providerName,
  expiresAt,
  url,
  returnUrl,
  status,
}: MagicLinkModel): MagicLink {
  return {
    id,
    applicationId,
    authType: authType as MagicLink['authType'],
    customerId,
    providerId,
    providerName: providerName as ProviderName,
    expiresAt,
    url,
    returnUrl: returnUrl ?? undefined,
    status,
  };
}
