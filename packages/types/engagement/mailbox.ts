import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, EngagementListParams, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysMailbox = SnakecasedKeys<Mailbox>;
export type SnakecasedKeysMailboxWithTenant = SnakecasedKeysMailbox & SnakecasedEngagementTenantFields;

type CoreMailbox = {
  email: string | null;
  userId: string | null;
  isDisabled: boolean | null | undefined;
};

export type Mailbox = BaseEngagementModel & CoreMailbox;

export type RemoteMailboxTypes = {
  object: Mailbox;
  listParams: EngagementListParams;
  createParams: never;
  upsertParams: never;
  updateParams: never;
  searchParams: never;
};
