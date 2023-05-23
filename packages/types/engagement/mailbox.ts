import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelRemoteOnlyParams } from './base';

export type SnakecasedKeysMailbox = SnakecasedKeys<Mailbox>;
export type SnakecasedKeysSimpleMailbox = SnakecasedKeys<SimpleMailbox>;
export type SnakecasedKeysSimpleMailboxWithTenant = SnakecasedKeysSimpleMailbox & {
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

export type SimpleMailbox = BaseMailbox & {
  lastModifiedAt: Date;
  remoteUserId: string | null;
  rawData: Record<string, any>;
};

export type RemoteMailbox = BaseMailbox &
  BaseEngagementModelRemoteOnlyParams & {
    remoteUserId: string | null;
    rawData: Record<string, any>;
  };

export type RemoteMailboxTypes = {
  object: Mailbox;
  createParams: never;
  updateParams: never;
};
