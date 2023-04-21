import { CustomFields } from '..';
import { SnakecasedKeys } from '../snakecased_keys';
import { BaseCrmModel } from './base';

export type SnakecasedKeysEvent = SnakecasedKeys<Event>;

export type SnakecasedKeysEventWithTenant = SnakecasedKeysEvent & {
  provider_name: string;
  customer_id: string;
};

export type Event = BaseCrmModel & {
  type: string | null;
  subject: string | null;
  content: string | null;
  startTime: Date | null;
  endTime: Date | null;

  ownerId: string | null;
  accountId: string | null;
  contactId: string | null;
  leadId: string | null;
  opportunityId: string | null;
};

export type EventCreateParams = {
  type?: string | null;
  subject?: string | null;
  content?: string | null;
  startTime?: Date | null;
  endTime?: Date | null;

  accountId?: string | null;
  ownerId?: string | null;
  contactId?: string | null;
  leadId?: string | null;
  opportunityId?: string | null;

  customFields?: CustomFields;
};

export type EventUpdateParams = EventCreateParams & {
  id: string;
};
