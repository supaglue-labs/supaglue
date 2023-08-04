import type { ProviderName } from '.';

export type MagicLink = {
  id: string;
  applicationId: string;
  customerId: string;
  providerId: string;
  providerName: ProviderName;
  expiresAt: Date;
  url: string;
  returnUrl?: string;
  // TODO: Make enums
  status: string;
};

export type MagicLinkCreateParams = {
  // external id
  customerId: string;
  providerName: string;
  expirationSecs: number;
  returnUrl?: string;
};
