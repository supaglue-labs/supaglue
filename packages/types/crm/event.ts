import { Account, Contact, CustomFields, Lead, Opportunity, User } from '..';

type BaseEvent = {
  remoteId: string;
  type: string | null;
  subject: string | null;
  content: string | null;
  startTime: Date | null;
  endTime: Date | null;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

export type Event = BaseEvent & {
  id: string;
  lastModifiedAt: Date | null;
  ownerId: string | null;
  owner?: User;
  accountId: string | null;
  account?: Account;
  contactId: string | null;
  contact?: Contact;
  leadId: string | null;
  lead?: Lead;
  opportunityId: string | null;
  opportunity?: Opportunity;
};

export type RemoteEvent = BaseEvent & {
  remoteAccountId: string | null;
  remoteOwnerId: string | null;
  remoteContactId: string | null;
  remoteLeadId: string | null;
  remoteOpportunityId: string | null;
  remoteDeletedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
};

type BaseEventCreateParams = {
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

export type EventCreateParams = BaseEventCreateParams;
export type RemoteEventCreateParams = BaseEventCreateParams;

export type EventUpdateParams = EventCreateParams & {
  id: string;
};

export type RemoteEventUpdateParams = RemoteEventCreateParams & {
  remoteId: string;
};
