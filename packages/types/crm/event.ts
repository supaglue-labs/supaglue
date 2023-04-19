import { CustomFields } from '..';
import { BaseCrmModel } from './base';

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
  remoteId: string;
};
