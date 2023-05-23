import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelRemoteOnlyParams } from './base';

export type SnakecasedKeysMailbox = SnakecasedKeys<Mailbox>;

export type SnakecasedKeysMailboxWithTenant = SnakecasedKeysMailbox & {
  provider_name: string;
  customer_id: string;
};

export type BaseMailbox = BaseEngagementModel & {
  email: string | null;
};

export type Mailbox = BaseMailbox &
  BaseEngagementModelNonRemoteParams & {
    userId: string | null;
    rawData?: Record<string, any>;
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
