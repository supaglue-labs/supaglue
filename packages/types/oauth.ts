export type OAuthConfigDecrypted = {
  oauthScopes: string[];
  credentials: OAuthCredentials;
};

export type OAuthConfigEncrypted = {
  oauthScopes: string[];
  credentials: string;
};

export type OAuthCredentials = {
  oauthClientId: string;
  oauthClientSecret: string;
};

export type ManagedOauthArgs = {
  managedOauthConfig: OAuthConfigDecrypted;
  hideOauthConfig: boolean;
};
