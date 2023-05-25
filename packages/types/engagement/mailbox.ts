import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelV2 } from './base';

export type SnakecasedKeysMailbox = SnakecasedKeys<Mailbox>;
export type SnakecasedKeysMailboxV2 = SnakecasedKeys<MailboxV2>;
export type SnakecasedKeysMailboxV2WithTenant = SnakecasedKeysMailboxV2 & {
  provider_name: string;
  customer_id: string;
};

export type BaseMailbox = BaseEngagementModel & {
  email: string | null;
};

// TODO: Rename/consolidate when we move entirely to managed syncs
export type Mailbox = BaseMailbox &
  BaseEngagementModelNonRemoteParams & {
    userId: string | null;
    rawData?: Record<string, any>;
  };

export type RemoteMailbox = BaseEngagementModelV2 & {
  email: string | null;
  userId: string | null;
};

export type MailboxV2 = RemoteMailbox;

export type RemoteMailboxTypes = {
  object: Mailbox;
  createParams: never;
  updateParams: never;
};
