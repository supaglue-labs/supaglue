import { BaseEngagementModel } from './base';

export type Sequence = BaseEngagementModel & {
  isEnabled: boolean | null;
  name: string | null;
  tags: string[];
  numSteps: number;
  scheduledCount: number;
  openedCount: number;
  optedOutCount: number;
  repliedCount: number;
  clickedCount: number;
};

export type SequenceCreateParams = {
  name: string;
  shareType: 'team' | 'private';
};

export type SequenceStartParams = {
  id: string;
  fields: {
    contactId: string;
    mailboxId: string;
  };
};

export type SequenceTypes = {
  object: Sequence;
  createParams: SequenceCreateParams;
  startParams: SequenceStartParams;
};
