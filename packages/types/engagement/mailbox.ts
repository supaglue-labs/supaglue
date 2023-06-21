import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysMailboxV2 = SnakecasedKeys<MailboxV2>;
export type SnakecasedKeysMailboxWithTenant = SnakecasedKeysMailboxV2 & SnakecasedEngagementTenantFields;

type CoreMailbox = {
  email: string | null;
  userId: string | null;
};

export type MailboxV2 = BaseEngagementModel & CoreMailbox;

export type RemoteMailboxTypes = {
  object: MailboxV2;
  createParams: never;
  updateParams: never;
};
