import type { ProviderName } from '.';

export type MagicLink = {
  id: string;
  applicationId: string;
  authType: 'oauth2' | 'api_key' | 'access_key_secret';
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
  authType: 'oauth2' | 'api_key' | 'access_key_secret';
  providerName: string;
  expirationSecs: number;
  returnUrl?: string;
};
