import type {
  AccessKeySecretConnectionCredentialsDecrypted,
  ApiKeyConnectionCredentialsDecrypted,
  MarketoOauthConnectionCredentialsDecrypted,
  ProviderName,
  SalesforceMarketingCloudAccountEngagementCredentialsDecrypted,
} from '.';

export type MagicLink = {
  id: string;
  applicationId: string;
  customerId: string; // external customer id
  providerId: string;
  providerName: ProviderName;
  expiresAt: Date;
  url: string;
  returnUrl: string;
  status: string;
};

export type MagicLinkAuthType = 'oauth2' | 'api_key' | 'access_key_secret';

export type MagicLinkCreateParams = {
  // external id
  customerId: string;
  providerName: string;
  expirationSecs: number;
  returnUrl: string;
};

export type MagicLinkData = ValidMagicLinkData | InvalidMagicLinkData;

export type ValidMagicLinkData = {
  code: 'magic_link_valid';
  magicLink: MagicLink;
};

export type InvalidMagicLinkData = {
  code: 'magic_link_already_used' | 'magic_link_expired' | 'magic_link_not_found';
  error: string;
};

export type MagicLinkConsumeParams =
  | ApiKeyConnectionCredentialsDecrypted
  | AccessKeySecretConnectionCredentialsDecrypted
  | MarketoOauthConnectionCredentialsDecrypted
  | SalesforceMarketingCloudAccountEngagementCredentialsDecrypted;
