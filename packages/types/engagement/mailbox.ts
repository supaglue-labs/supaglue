import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysMailbox = SnakecasedKeys<Mailbox>;
export type SnakecasedKeysMailboxWithTenant = SnakecasedKeysMailbox & SnakecasedEngagementTenantFields;

type CoreMailbox = {
  email: string | null;
  userId: string | null;
  isDisabled: boolean | null;
};

export type Mailbox = BaseEngagementModel & CoreMailbox;

export type RemoteMailboxTypes = {
  object: Mailbox;
  createParams: never;
  updateParams: never;
};
