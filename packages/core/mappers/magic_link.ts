import type { MagicLink as MagicLinkModel } from '@supaglue/db';
import type { MagicLink, ProviderName } from '@supaglue/types';
import { parseCustomerIdPk } from '../lib';

export function fromMagicLinkModel({
  id,
  applicationId,
  customerId,
  providerId,
  providerName,
  expiresAt,
  url,
  returnUrl,
  status,
}: MagicLinkModel): MagicLink {
  const { externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    providerId,
    providerName: providerName as ProviderName,
    expiresAt,
    url,
    returnUrl: returnUrl ?? undefined,
    status,
  };
}
