import {
  Account,
  BaseCrmModelNonRemoteParams,
  BaseCrmModelRemoteOnlyParams,
  Contact,
  CustomFields,
  Lead,
  Opportunity,
  User,
} from '..';
import { BaseCrmModel } from './base';

type BaseEvent = BaseCrmModel & {
  type: string | null;
  subject: string | null;
  content: string | null;
  startTime: Date | null;
  endTime: Date | null;
};

export type Event = BaseEvent &
  BaseCrmModelNonRemoteParams & {
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
    rawData?: Record<string, any>;
  };

export type RemoteEvent = BaseEvent &
  BaseCrmModelRemoteOnlyParams & {
    remoteAccountId: string | null;
    remoteOwnerId: string | null;
    remoteContactId: string | null;
    remoteLeadId: string | null;
    remoteOpportunityId: string | null;
    rawData: Record<string, any>;
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
