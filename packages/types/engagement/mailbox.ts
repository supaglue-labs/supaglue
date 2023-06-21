import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModelV2, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysMailboxV2 = SnakecasedKeys<MailboxV2>;
export type SnakecasedKeysMailboxV2WithTenant = SnakecasedKeysMailboxV2 & SnakecasedEngagementTenantFields;

type CoreMailbox = {
  email: string | null;
  userId: string | null;
};

export type MailboxV2 = BaseEngagementModelV2 & CoreMailbox;

export type RemoteMailboxTypes = {
  object: MailboxV2;
  createParams: never;
  updateParams: never;
};
