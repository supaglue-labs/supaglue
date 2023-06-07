export type OauthConfigDecrypted = {
  oauthScopes: string[];
  credentials: OauthCredentials;
};

export type OauthConfigEncrypted = {
  oauthScopes: string[];
  credentials: string;
};

export type OauthCredentials = {
  oauthClientId: string;
  oauthClientSecret: string;
};
