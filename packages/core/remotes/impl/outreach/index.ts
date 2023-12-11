import axios, { isAxiosError } from '@supaglue/core/remotes/sg_axios';
import type {
  ConnectionUnsafe,
  EngagementOauthProvider,
  Property,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
  StandardOrCustomObjectDef,
} from '@supaglue/types';
import type {
  Account,
  AccountCreateParams,
  AccountSearchParams,
  AccountUpdateParams,
  AccountUpsertParams,
  Contact,
  ContactCreateParams,
  ContactSearchParams,
  ContactUpdateParams,
  EngagementCommonObjectType,
  EngagementCommonObjectTypeMap,
  EngagementListParams,
  Mailbox,
  Sequence,
  SequenceCreateParams,
  SequenceState,
  SequenceStateCreateParams,
  SequenceStateSearchParams,
  SequenceStep,
  SequenceStepCreateParams,
  SequenceTemplateCreateParams,
  SequenceTemplateId,
  User,
} from '@supaglue/types/engagement';
import { Readable } from 'stream';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  RemoteProviderError,
  SGConnectionNoLongerAuthenticatedError,
  TooManyRequestsError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../../errors';
import type { PaginatedSupaglueRecords } from '../../../lib';
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  encodeCursor,
  REFRESH_TOKEN_THRESHOLD_MS,
  retryWhenAxiosRateLimited,
} from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import type { UpsertCommonObjectRecordResponse } from '../../categories/engagement/base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';
import { paginator } from '../../utils/paginator';
import {
  fromOutreachAccountToAccount,
  fromOutreachMailboxToMailbox,
  fromOutreachProspectToContact,
  fromOutreachSequenceStateToSequenceState,
  fromOutreachSequenceToSequence,
  fromOutreachUserToUser,
  toOutreachAccountCreateParams,
  toOutreachAccountUpdateParams,
  toOutreachProspectCreateParams,
  toOutreachProspectUpdateParams,
  toOutreachSequenceCreateParams,
  toOutreachSequenceStateCreateParams,
  toOutreachSequenceStepCreateParams,
  toOutreachSequenceTemplateCreateParams,
  toOutreachTemplateCreateParams,
} from './mappers';
import type { components, paths } from './outreach.openapi.gen';

import { createOutreachClient } from './outreach.client';

const OUTREACH_RECORD_LIMIT = 1000;

export type Outreach = components['schemas'];

export type OutreachUser = NonNullable<
  Required<paths['/users/{id}']['get']['responses']['200']['content']['application/vnd.api+json']['data']>
>;
export type OutreachMailbox = NonNullable<
  Required<paths['/mailboxes/{id}']['get']['responses']['200']['content']['application/vnd.api+json']['data']>
>;
export type OutreachSequence = NonNullable<
  Required<paths['/sequences/{id}']['get']['responses']['200']['content']['application/vnd.api+json']['data']>
>;

export type OutreachRecord = {
  id: number;
  attributes: Record<string, any>;
  relationships: Record<string, any>;
  links: Record<string, any>;
};

type OutreachPaginatedRecords = {
  data: OutreachRecord[];
  meta: { count: number; count_truncated: boolean };
  links: {
    first?: string;
    next?: string;
    prev?: string;
  };
};

type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
};

class OutreachClient extends AbstractEngagementRemoteClient {
  readonly #credentials: Credentials;
  readonly #baseURL: string;

  readonly #api: ReturnType<typeof createOutreachClient>;

  public constructor(credentials: Credentials) {
    super('https://api.outreach.io');
    this.#baseURL = 'https://api.outreach.io';
    this.#credentials = credentials;
    this.#api = createOutreachClient({
      credentials: this.#credentials,
      onTokenRefreshed: (tokens) => this.emit('token_refreshed', tokens),
    });
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#credentials.accessToken}`,
    };
  }

  public override async listProperties(object: StandardOrCustomObjectDef): Promise<Property[]> {
    switch (object.type) {
      case 'standard': {
        switch (object.name) {
          case 'prospect':
            return [
              {
                id: 'addedAt',
                label: 'addedAt',
                type: 'string',
              },
              {
                id: 'addressCity',
                label: 'addressCity',
                type: 'string',
              },
              {
                id: 'addressCountry',
                label: 'addressCountry',
                type: 'string',
              },
              {
                id: 'addressState',
                label: 'addressState',
                type: 'string',
              },
              {
                id: 'addressStreet',
                label: 'addressStreet',
                type: 'string',
              },
              {
                id: 'addressStreet2',
                label: 'addressStreet2',
                type: 'string',
              },
              {
                id: 'addressZip',
                label: 'addressZip',
                type: 'string',
              },
              {
                id: 'angelListUrl',
                label: 'angelListUrl',
                type: 'string',
              },
              {
                id: 'availableAt',
                label: 'availableAt',
                type: 'string',
              },
              {
                id: 'callOptedOut',
                label: 'callOptedOut',
                type: 'boolean',
              },
              {
                id: 'callsOptStatus',
                label: 'callsOptStatus',
                type: 'string',
              },
              {
                id: 'callsOptedAt',
                label: 'callsOptedAt',
                type: 'string',
              },
              {
                id: 'campaignName',
                label: 'campaignName',
                type: 'string',
              },
              {
                id: 'clickCount',
                label: 'clickCount',
                type: 'integer',
              },
              {
                id: 'company',
                label: 'company',
                type: 'string',
              },
              {
                id: 'contactHistogram',
                label: 'contactHistogram',
                type: 'array',
              },
              {
                id: 'createdAt',
                label: 'createdAt',
                type: 'string',
              },
              {
                id: 'custom1',
                label: 'custom1',
                type: 'string',
              },
              {
                id: 'custom2',
                label: 'custom2',
                type: 'string',
              },
              {
                id: 'custom3',
                label: 'custom3',
                type: 'string',
              },
              {
                id: 'custom4',
                label: 'custom4',
                type: 'string',
              },
              {
                id: 'custom5',
                label: 'custom5',
                type: 'string',
              },
              {
                id: 'custom6',
                label: 'custom6',
                type: 'string',
              },
              {
                id: 'custom7',
                label: 'custom7',
                type: 'string',
              },
              {
                id: 'custom8',
                label: 'custom8',
                type: 'string',
              },
              {
                id: 'custom9',
                label: 'custom9',
                type: 'string',
              },
              {
                id: 'custom10',
                label: 'custom10',
                type: 'string',
              },
              {
                id: 'custom11',
                label: 'custom11',
                type: 'string',
              },
              {
                id: 'custom12',
                label: 'custom12',
                type: 'string',
              },
              {
                id: 'custom13',
                label: 'custom13',
                type: 'string',
              },
              {
                id: 'custom14',
                label: 'custom14',
                type: 'string',
              },
              {
                id: 'custom15',
                label: 'custom15',
                type: 'string',
              },
              {
                id: 'custom16',
                label: 'custom16',
                type: 'string',
              },
              {
                id: 'custom17',
                label: 'custom17',
                type: 'string',
              },
              {
                id: 'custom18',
                label: 'custom18',
                type: 'string',
              },
              {
                id: 'custom19',
                label: 'custom19',
                type: 'string',
              },
              {
                id: 'custom20',
                label: 'custom20',
                type: 'string',
              },
              {
                id: 'custom21',
                label: 'custom21',
                type: 'string',
              },
              {
                id: 'custom22',
                label: 'custom22',
                type: 'string',
              },
              {
                id: 'custom23',
                label: 'custom23',
                type: 'string',
              },
              {
                id: 'custom24',
                label: 'custom24',
                type: 'string',
              },
              {
                id: 'custom25',
                label: 'custom25',
                type: 'string',
              },
              {
                id: 'custom26',
                label: 'custom26',
                type: 'string',
              },
              {
                id: 'custom27',
                label: 'custom27',
                type: 'string',
              },
              {
                id: 'custom28',
                label: 'custom28',
                type: 'string',
              },
              {
                id: 'custom29',
                label: 'custom29',
                type: 'string',
              },
              {
                id: 'custom30',
                label: 'custom30',
                type: 'string',
              },
              {
                id: 'custom31',
                label: 'custom31',
                type: 'string',
              },
              {
                id: 'custom32',
                label: 'custom32',
                type: 'string',
              },
              {
                id: 'custom33',
                label: 'custom33',
                type: 'string',
              },
              {
                id: 'custom34',
                label: 'custom34',
                type: 'string',
              },
              {
                id: 'custom35',
                label: 'custom35',
                type: 'string',
              },
              {
                id: 'custom36',
                label: 'custom36',
                type: 'string',
              },
              {
                id: 'custom37',
                label: 'custom37',
                type: 'string',
              },
              {
                id: 'custom38',
                label: 'custom38',
                type: 'string',
              },
              {
                id: 'custom39',
                label: 'custom39',
                type: 'string',
              },
              {
                id: 'custom40',
                label: 'custom40',
                type: 'string',
              },
              {
                id: 'custom41',
                label: 'custom41',
                type: 'string',
              },
              {
                id: 'custom42',
                label: 'custom42',
                type: 'string',
              },
              {
                id: 'custom43',
                label: 'custom43',
                type: 'string',
              },
              {
                id: 'custom44',
                label: 'custom44',
                type: 'string',
              },
              {
                id: 'custom45',
                label: 'custom45',
                type: 'string',
              },
              {
                id: 'custom46',
                label: 'custom46',
                type: 'string',
              },
              {
                id: 'custom47',
                label: 'custom47',
                type: 'string',
              },
              {
                id: 'custom48',
                label: 'custom48',
                type: 'string',
              },
              {
                id: 'custom49',
                label: 'custom49',
                type: 'string',
              },
              {
                id: 'custom50',
                label: 'custom50',
                type: 'string',
              },
              {
                id: 'custom51',
                label: 'custom51',
                type: 'string',
              },
              {
                id: 'custom52',
                label: 'custom52',
                type: 'string',
              },
              {
                id: 'custom53',
                label: 'custom53',
                type: 'string',
              },
              {
                id: 'custom54',
                label: 'custom54',
                type: 'string',
              },
              {
                id: 'custom55',
                label: 'custom55',
                type: 'string',
              },
              {
                id: 'custom56',
                label: 'custom56',
                type: 'string',
              },
              {
                id: 'custom57',
                label: 'custom57',
                type: 'string',
              },
              {
                id: 'custom58',
                label: 'custom58',
                type: 'string',
              },
              {
                id: 'custom59',
                label: 'custom59',
                type: 'string',
              },
              {
                id: 'custom60',
                label: 'custom60',
                type: 'string',
              },
              {
                id: 'custom61',
                label: 'custom61',
                type: 'string',
              },
              {
                id: 'custom62',
                label: 'custom62',
                type: 'string',
              },
              {
                id: 'custom63',
                label: 'custom63',
                type: 'string',
              },
              {
                id: 'custom64',
                label: 'custom64',
                type: 'string',
              },
              {
                id: 'custom65',
                label: 'custom65',
                type: 'string',
              },
              {
                id: 'custom66',
                label: 'custom66',
                type: 'string',
              },
              {
                id: 'custom67',
                label: 'custom67',
                type: 'string',
              },
              {
                id: 'custom68',
                label: 'custom68',
                type: 'string',
              },
              {
                id: 'custom69',
                label: 'custom69',
                type: 'string',
              },
              {
                id: 'custom70',
                label: 'custom70',
                type: 'string',
              },
              {
                id: 'custom71',
                label: 'custom71',
                type: 'string',
              },
              {
                id: 'custom72',
                label: 'custom72',
                type: 'string',
              },
              {
                id: 'custom73',
                label: 'custom73',
                type: 'string',
              },
              {
                id: 'custom74',
                label: 'custom74',
                type: 'string',
              },
              {
                id: 'custom75',
                label: 'custom75',
                type: 'string',
              },
              {
                id: 'custom76',
                label: 'custom76',
                type: 'string',
              },
              {
                id: 'custom77',
                label: 'custom77',
                type: 'string',
              },
              {
                id: 'custom78',
                label: 'custom78',
                type: 'string',
              },
              {
                id: 'custom79',
                label: 'custom79',
                type: 'string',
              },
              {
                id: 'custom80',
                label: 'custom80',
                type: 'string',
              },
              {
                id: 'custom81',
                label: 'custom81',
                type: 'string',
              },
              {
                id: 'custom82',
                label: 'custom82',
                type: 'string',
              },
              {
                id: 'custom83',
                label: 'custom83',
                type: 'string',
              },
              {
                id: 'custom84',
                label: 'custom84',
                type: 'string',
              },
              {
                id: 'custom85',
                label: 'custom85',
                type: 'string',
              },
              {
                id: 'custom86',
                label: 'custom86',
                type: 'string',
              },
              {
                id: 'custom87',
                label: 'custom87',
                type: 'string',
              },
              {
                id: 'custom88',
                label: 'custom88',
                type: 'string',
              },
              {
                id: 'custom89',
                label: 'custom89',
                type: 'string',
              },
              {
                id: 'custom90',
                label: 'custom90',
                type: 'string',
              },
              {
                id: 'custom91',
                label: 'custom91',
                type: 'string',
              },
              {
                id: 'custom92',
                label: 'custom92',
                type: 'string',
              },
              {
                id: 'custom93',
                label: 'custom93',
                type: 'string',
              },
              {
                id: 'custom94',
                label: 'custom94',
                type: 'string',
              },
              {
                id: 'custom95',
                label: 'custom95',
                type: 'string',
              },
              {
                id: 'custom96',
                label: 'custom96',
                type: 'string',
              },
              {
                id: 'custom97',
                label: 'custom97',
                type: 'string',
              },
              {
                id: 'custom98',
                label: 'custom98',
                type: 'string',
              },
              {
                id: 'custom99',
                label: 'custom99',
                type: 'string',
              },
              {
                id: 'custom100',
                label: 'custom100',
                type: 'string',
              },
              {
                id: 'custom101',
                label: 'custom101',
                type: 'string',
              },
              {
                id: 'custom102',
                label: 'custom102',
                type: 'string',
              },
              {
                id: 'custom103',
                label: 'custom103',
                type: 'string',
              },
              {
                id: 'custom104',
                label: 'custom104',
                type: 'string',
              },
              {
                id: 'custom105',
                label: 'custom105',
                type: 'string',
              },
              {
                id: 'custom106',
                label: 'custom106',
                type: 'string',
              },
              {
                id: 'custom107',
                label: 'custom107',
                type: 'string',
              },
              {
                id: 'custom108',
                label: 'custom108',
                type: 'string',
              },
              {
                id: 'custom109',
                label: 'custom109',
                type: 'string',
              },
              {
                id: 'custom110',
                label: 'custom110',
                type: 'string',
              },
              {
                id: 'custom111',
                label: 'custom111',
                type: 'string',
              },
              {
                id: 'custom112',
                label: 'custom112',
                type: 'string',
              },
              {
                id: 'custom113',
                label: 'custom113',
                type: 'string',
              },
              {
                id: 'custom114',
                label: 'custom114',
                type: 'string',
              },
              {
                id: 'custom115',
                label: 'custom115',
                type: 'string',
              },
              {
                id: 'custom116',
                label: 'custom116',
                type: 'string',
              },
              {
                id: 'custom117',
                label: 'custom117',
                type: 'string',
              },
              {
                id: 'custom118',
                label: 'custom118',
                type: 'string',
              },
              {
                id: 'custom119',
                label: 'custom119',
                type: 'string',
              },
              {
                id: 'custom120',
                label: 'custom120',
                type: 'string',
              },
              {
                id: 'custom121',
                label: 'custom121',
                type: 'string',
              },
              {
                id: 'custom122',
                label: 'custom122',
                type: 'string',
              },
              {
                id: 'custom123',
                label: 'custom123',
                type: 'string',
              },
              {
                id: 'custom124',
                label: 'custom124',
                type: 'string',
              },
              {
                id: 'custom125',
                label: 'custom125',
                type: 'string',
              },
              {
                id: 'custom126',
                label: 'custom126',
                type: 'string',
              },
              {
                id: 'custom127',
                label: 'custom127',
                type: 'string',
              },
              {
                id: 'custom128',
                label: 'custom128',
                type: 'string',
              },
              {
                id: 'custom129',
                label: 'custom129',
                type: 'string',
              },
              {
                id: 'custom130',
                label: 'custom130',
                type: 'string',
              },
              {
                id: 'custom131',
                label: 'custom131',
                type: 'string',
              },
              {
                id: 'custom132',
                label: 'custom132',
                type: 'string',
              },
              {
                id: 'custom133',
                label: 'custom133',
                type: 'string',
              },
              {
                id: 'custom134',
                label: 'custom134',
                type: 'string',
              },
              {
                id: 'custom135',
                label: 'custom135',
                type: 'string',
              },
              {
                id: 'custom136',
                label: 'custom136',
                type: 'string',
              },
              {
                id: 'custom137',
                label: 'custom137',
                type: 'string',
              },
              {
                id: 'custom138',
                label: 'custom138',
                type: 'string',
              },
              {
                id: 'custom139',
                label: 'custom139',
                type: 'string',
              },
              {
                id: 'custom140',
                label: 'custom140',
                type: 'string',
              },
              {
                id: 'custom141',
                label: 'custom141',
                type: 'string',
              },
              {
                id: 'custom142',
                label: 'custom142',
                type: 'string',
              },
              {
                id: 'custom143',
                label: 'custom143',
                type: 'string',
              },
              {
                id: 'custom144',
                label: 'custom144',
                type: 'string',
              },
              {
                id: 'custom145',
                label: 'custom145',
                type: 'string',
              },
              {
                id: 'custom146',
                label: 'custom146',
                type: 'string',
              },
              {
                id: 'custom147',
                label: 'custom147',
                type: 'string',
              },
              {
                id: 'custom148',
                label: 'custom148',
                type: 'string',
              },
              {
                id: 'custom149',
                label: 'custom149',
                type: 'string',
              },
              {
                id: 'custom150',
                label: 'custom150',
                type: 'string',
              },
              {
                id: 'dateOfBirth',
                label: 'dateOfBirth',
                type: 'string',
              },
              {
                id: 'degree',
                label: 'degree',
                type: 'string',
              },
              {
                id: 'emailOptedOut',
                label: 'emailOptedOut',
                type: 'boolean',
              },
              {
                id: 'emails',
                label: 'emails',
                type: 'array',
              },
              {
                id: 'emailsOptStatus',
                label: 'emailsOptStatus',
                type: 'string',
              },
              {
                id: 'emailsOptedAt',
                label: 'emailsOptedAt',
                type: 'string',
              },
              {
                id: 'engagedAt',
                label: 'engagedAt',
                type: 'string',
              },
              {
                id: 'engagedScore',
                label: 'engagedScore',
                type: 'number',
              },
              {
                id: 'eventName',
                label: 'eventName',
                type: 'string',
              },
              {
                id: 'externalId',
                label: 'externalId',
                type: 'string',
              },
              {
                id: 'externalOwner',
                label: 'externalOwner',
                type: 'string',
              },
              {
                id: 'externalSource',
                label: 'externalSource',
                type: 'string',
              },
              {
                id: 'facebookUrl',
                label: 'facebookUrl',
                type: 'string',
              },
              {
                id: 'firstName',
                label: 'firstName',
                type: 'string',
              },
              {
                id: 'gender',
                label: 'gender',
                type: 'string',
              },
              {
                id: 'githubUrl',
                label: 'githubUrl',
                type: 'string',
              },
              {
                id: 'githubUsername',
                label: 'githubUsername',
                type: 'string',
              },
              {
                id: 'googlePlusUrl',
                label: 'googlePlusUrl',
                type: 'string',
              },
              {
                id: 'graduationDate',
                label: 'graduationDate',
                type: 'string',
              },
              {
                id: 'homePhones',
                label: 'homePhones',
                type: 'array',
              },
              {
                id: 'jobStartDate',
                label: 'jobStartDate',
                type: 'string',
              },
              {
                id: 'lastName',
                label: 'lastName',
                type: 'string',
              },
              {
                id: 'linkedInConnections',
                label: 'linkedInConnections',
                type: 'integer',
              },
              {
                id: 'linkedInId',
                label: 'linkedInId',
                type: 'string',
              },
              {
                id: 'linkedInSlug',
                label: 'linkedInSlug',
                type: 'string',
              },
              {
                id: 'linkedInUrl',
                label: 'linkedInUrl',
                type: 'string',
              },
              {
                id: 'middleName',
                label: 'middleName',
                type: 'string',
              },
              {
                id: 'mobilePhones',
                label: 'mobilePhones',
                type: 'array',
              },
              {
                id: 'name',
                label: 'name',
                type: 'string',
              },
              {
                id: 'nickname',
                label: 'nickname',
                type: 'string',
              },
              {
                id: 'occupation',
                label: 'occupation',
                type: 'string',
              },
              {
                id: 'openCount',
                label: 'openCount',
                type: 'integer',
              },
              {
                id: 'optedOut',
                label: 'optedOut',
                type: 'boolean',
              },
              {
                id: 'optedOutAt',
                label: 'optedOutAt',
                type: 'string',
              },
              {
                id: 'otherPhones',
                label: 'otherPhones',
                type: 'array',
              },
              {
                id: 'personalNote1',
                label: 'personalNote1',
                type: 'string',
              },
              {
                id: 'personalNote2',
                label: 'personalNote2',
                type: 'string',
              },
              {
                id: 'preferredContact',
                label: 'preferredContact',
                type: 'string',
              },
              {
                id: 'quoraUrl',
                label: 'quoraUrl',
                type: 'string',
              },
              {
                id: 'region',
                label: 'region',
                type: 'string',
              },
              {
                id: 'replyCount',
                label: 'replyCount',
                type: 'integer',
              },
              {
                id: 'school',
                label: 'school',
                type: 'string',
              },
              {
                id: 'score',
                label: 'score',
                type: 'number',
              },
              {
                id: 'sharingTeamId',
                label: 'sharingTeamId',
                type: 'string',
              },
              {
                id: 'source',
                label: 'source',
                type: 'string',
              },
              {
                id: 'specialties',
                label: 'specialties',
                type: 'string',
              },
              {
                id: 'stackOverflowId',
                label: 'stackOverflowId',
                type: 'string',
              },
              {
                id: 'stackOverflowUrl',
                label: 'stackOverflowUrl',
                type: 'string',
              },
              {
                id: 'tags',
                label: 'tags',
                type: 'array',
              },
              {
                id: 'timeZone',
                label: 'timeZone',
                type: 'string',
              },
              {
                id: 'timeZoneIana',
                label: 'timeZoneIana',
                type: 'string',
              },
              {
                id: 'timeZoneInferred',
                label: 'timeZoneInferred',
                type: 'string',
              },
              {
                id: 'title',
                label: 'title',
                type: 'string',
              },
              {
                id: 'touchedAt',
                label: 'touchedAt',
                type: 'string',
              },
              {
                id: 'trashedAt',
                label: 'trashedAt',
                type: 'string',
              },
              {
                id: 'twitterUrl',
                label: 'twitterUrl',
                type: 'string',
              },
              {
                id: 'twitterUsername',
                label: 'twitterUsername',
                type: 'string',
              },
              {
                id: 'updatedAt',
                label: 'updatedAt',
                type: 'string',
              },
              {
                id: 'voipPhones',
                label: 'voipPhones',
                type: 'array',
              },
              {
                id: 'websiteUrl1',
                label: 'websiteUrl1',
                type: 'string',
              },
              {
                id: 'websiteUrl2',
                label: 'websiteUrl2',
                type: 'string',
              },
              {
                id: 'websiteUrl3',
                label: 'websiteUrl3',
                type: 'string',
              },
              {
                id: 'workPhones',
                label: 'workPhones',
                type: 'array',
              },
            ];
          default:
            throw new BadRequestError(`Standard object ${object.name} not supported`);
        }
        break;
      }
      case 'custom':
      default:
        throw new BadRequestError(`Object type ${object.type} not supported`);
    }
  }

  public override async getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']> {
    await this.maybeRefreshAccessToken();
    switch (commonObjectType) {
      case 'contact':
        // TODO: before we do this gotta handle handle errors in the openapi client
        // return await this.#api
        //   .GET('/prospects/{id}', { params: { path: { id: Number.parseInt(id) } } })
        //   .then((response) => fromOutreachProspectToContact(response.data?.data as OutreachRecord));
        return await this.#getRecord(id, '/api/v2/prospects', fromOutreachProspectToContact);
      case 'user':
        return await this.#getRecord(id, '/api/v2/users', (r: any) => fromOutreachUserToUser(r));
      case 'sequence': {
        // Maybe we should do a graphql api... this is crazy.
        const [{ data: sequence }, steps] = await Promise.all([
          this.#api.GET('/sequences/{id}', { params: { path: { id: Number.parseInt(id) } } }),
          this.#api.GET('/sequenceSteps', { params: { query: { 'filter[sequence][id]': id } } }).then((r) =>
            Promise.all(
              r.data.data?.map(async (s) => ({
                ...s,
                sequenceTemplates: await this.#api
                  .GET('/sequenceTemplates', {
                    params: { query: { 'filter[sequenceStep][id]': s.id } },
                  })
                  .then((r) =>
                    Promise.all(
                      r.data.data?.map(async (seqTemplate) => ({
                        ...seqTemplate,
                        template: await this.#api
                          .GET('/templates/{id}', {
                            params: { path: { id: seqTemplate.relationships!.template!.data!.id! } },
                          })
                          .then((r) => r.data.data),
                      })) ?? []
                    )
                  ),
              })) ?? []
            )
          ),
        ]);
        return {
          ...fromOutreachSequenceToSequence(sequence?.data as OutreachSequence),
          steps: steps?.map(
            ({ id, attributes: s = {}, sequenceTemplates }): SequenceStep => ({
              id: `${id}`,
              createdAt: new Date(s.createdAt!),
              updatedAt: new Date(s.updatedAt!),
              type: s.stepType as 'auto_email' | 'manual_email' | 'call' | 'task',
              date: s.date,
              name: s.displayName,
              intervalSeconds: s.interval,
              taskNote: s.taskNote,
              template: {
                id: `${sequenceTemplates?.[0].template?.id}`,
                body: sequenceTemplates?.[0].template?.attributes?.bodyHtml ?? '',
                subject: sequenceTemplates?.[0].template?.attributes?.subject ?? '',
              },
            })
          ),
        } satisfies Sequence;
      }
      case 'mailbox':
        return await this.#getRecord(id, '/api/v2/mailboxes', (r: any) => fromOutreachMailboxToMailbox(r));
      case 'sequence_state':
        return await this.#getRecord(id, '/api/v2/sequenceStates', fromOutreachSequenceStateToSequenceState);
      case 'account':
        return await this.#getRecord(id, '/api/v2/accounts', fromOutreachAccountToAccount);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async #getRecord<T>(id: string, path: string, mapper: (record: OutreachRecord) => T): Promise<T> {
    const response = await axios.get<{ data: OutreachRecord }>(`${this.#baseURL}${path}/${id}`, {
      headers: this.getAuthHeadersForPassthroughRequest(),
    });
    return mapper(response.data.data);
  }

  public override async streamCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#streamRecords('/api/v2/prospects', fromOutreachProspectToContact, updatedAfter);
      case 'user':
        return await this.#streamRecords('/api/v2/users', (r: any) => fromOutreachUserToUser(r), updatedAfter);
      case 'sequence':
        return await this.#streamRecords(
          '/api/v2/sequences',
          (r: any) => fromOutreachSequenceToSequence(r),
          updatedAfter
        );
      case 'mailbox':
        return await this.#streamRecords(
          '/api/v2/mailboxes',
          (r: any) => fromOutreachMailboxToMailbox(r),
          updatedAfter
        );
      case 'sequence_state':
        return await this.#streamRecords(
          '/api/v2/sequenceStates',
          fromOutreachSequenceStateToSequenceState,
          updatedAfter
        );
      case 'account':
        return await this.#streamRecords('/api/v2/accounts', fromOutreachAccountToAccount, updatedAfter);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (
      !this.#credentials.expiresAt ||
      Date.parse(this.#credentials.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS
    ) {
      try {
        const response = await axios.post<{ refresh_token: string; access_token: string; expires_in: number }>(
          `${this.#baseURL}/oauth/token`,
          {
            client_id: this.#credentials.clientId,
            client_secret: this.#credentials.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: this.#credentials.refreshToken,
          }
        );

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;
        const newExpiresAt = new Date(Date.now() + response.data.expires_in * 1000).toISOString();

        this.#credentials.accessToken = newAccessToken;
        this.#credentials.refreshToken = newRefreshToken;
        this.#credentials.expiresAt = newExpiresAt;

        this.emit('token_refreshed', {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresAt: newExpiresAt,
        });
      } catch (e: any) {
        if (e.response?.status === 400) {
          throw new SGConnectionNoLongerAuthenticatedError('Unable to refresh access token. Refresh token invalid.');
        }
        throw e;
      }
    }
  }

  #getListRecordsFetcher(
    endpoint: string,
    updatedAfter?: Date,
    pageSize = OUTREACH_RECORD_LIMIT
  ): (link?: string) => Promise<OutreachPaginatedRecords> {
    return async (link?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        if (link) {
          const response = await axios.get<OutreachPaginatedRecords>(link, {
            headers: this.getAuthHeadersForPassthroughRequest(),
          });
          return response.data;
        }
        const response = await axios.get<OutreachPaginatedRecords>(endpoint, {
          params: updatedAfter
            ? {
                'page[size]': pageSize,
                ...getUpdatedAfterPathParam(updatedAfter),
              }
            : {
                'page[size]': pageSize,
              },
          headers: this.getAuthHeadersForPassthroughRequest(),
        });
        return response.data;
      });
    };
  }

  async #streamRecords<T>(path: string, mapper: (record: OutreachRecord) => T, updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}${path}`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: mapper(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  public override async upsertCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['upsertParams']
  ): Promise<UpsertCommonObjectRecordResponse<T>> {
    // TODO: figure out why type assertion is required here
    switch (commonObjectType) {
      case 'account':
        return { id: await this.upsertAccount(params as AccountUpsertParams) };
      case 'sequence_state':
      case 'contact':
      case 'sequence':
      case 'sequence_step':
      case 'mailbox':
      case 'user':
        throw new BadRequestError(`Create operation not supported for ${commonObjectType} object`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async upsertAccount(params: AccountUpsertParams): Promise<string> {
    const { domain, name } = params.upsertOn;

    if (!domain && !name) {
      throw new BadRequestError('Must specify at least one upsertOn field');
    }

    const searchResult = await this.#searchAccounts({
      filter: {
        domain: domain,
        name: name,
      },
    });

    if (searchResult.records.length > 1) {
      throw new BadRequestError('More than one account found for upsertOn fields');
    }
    if (searchResult.records.length) {
      return this.updateAccount({ ...params.record, id: searchResult.records[0].id.toString() });
    }
    return this.createAccount(params.record);
  }

  public override async createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<{ id: string; record?: EngagementCommonObjectTypeMap<T>['object'] }> {
    switch (commonObjectType) {
      case 'sequence_state':
        return {
          id: await this.createSequenceState(params as SequenceStateCreateParams),
        };
      case 'contact':
        return {
          id: await this.createContact(params as ContactCreateParams),
        };
      case 'account':
        return {
          id: await this.createAccount(params as AccountCreateParams),
        };
      case 'sequence':
        return {
          id: await this.createSequence(params as SequenceCreateParams),
        };
      case 'sequence_step':
        return {
          id: await this.createSequenceStep(params as SequenceStepCreateParams),
        };
      case 'mailbox':
      case 'user':
        throw new BadRequestError(`Create operation not supported for ${commonObjectType} object`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async createContact(params: ContactCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/prospects`,
      toOutreachProspectCreateParams(params),
      {
        headers: this.getAuthHeadersForPassthroughRequest(),
      }
    );
    return response.data.data.id.toString();
  }

  async createAccount(params: AccountCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/accounts`,
      toOutreachAccountCreateParams(params),
      {
        headers: this.getAuthHeadersForPassthroughRequest(),
      }
    );
    return response.data.data.id.toString();
  }

  async createSequenceState(params: SequenceStateCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    try {
      const response = await axios.post<{ data: OutreachRecord }>(
        `${this.#baseURL}/api/v2/sequenceStates`,
        toOutreachSequenceStateCreateParams(params),
        {
          headers: this.getAuthHeadersForPassthroughRequest(),
        }
      );
      return response.data.data.id.toString();
    } catch (e) {
      if (
        isAxiosError(e) &&
        e.response?.status === 422 &&
        e.response?.data?.errors?.[0]?.code === 'has already been in this sequence'
      ) {
        const sequenceStates = await this.#searchSequenceStates({
          filter: {
            sequenceId: params.sequenceId,
            contactId: params.contactId,
          },
        });
        return sequenceStates.records[0].id.toString();
      }
      throw e;
    }
  }

  async createSequence(params: SequenceCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/sequences`,
      toOutreachSequenceCreateParams(params),
      {
        headers: this.getAuthHeadersForPassthroughRequest(),
      }
    );

    const sequenceId = response.data.data.id.toString();

    // There should be a low number of steps, so we will try to create them all in parallel.
    await Promise.all(
      (params.steps ?? []).map((step, index) =>
        this.createSequenceStep({
          ...step,
          order: index + 1, // Ignore step.order and use the implicit order from array index instead.
          sequenceId, // Ignore sequence.id as well.
        })
      )
    );

    return sequenceId;
  }

  async createSequenceStep(params: SequenceStepCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    let templateId = (params.template as SequenceTemplateId).id;
    if (!templateId) {
      const response = await axios.post<{ data: OutreachRecord }>(
        `${this.#baseURL}/api/v2/templates`,
        toOutreachTemplateCreateParams(params.template as SequenceTemplateCreateParams),
        {
          headers: this.getAuthHeadersForPassthroughRequest(),
        }
      );
      templateId = response.data.data.id.toString();
    }
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/sequenceSteps`,
      toOutreachSequenceStepCreateParams(params),
      {
        headers: this.getAuthHeadersForPassthroughRequest(),
      }
    );

    const sequenceStepId = response.data.data.id.toString();
    await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/sequenceTemplates`,
      toOutreachSequenceTemplateCreateParams(params, parseInt(sequenceStepId), parseInt(templateId)),
      {
        headers: this.getAuthHeadersForPassthroughRequest(),
      }
    );
    return sequenceStepId;
  }

  public override async updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<{ id: string; record?: EngagementCommonObjectTypeMap<T>['object'] }> {
    switch (commonObjectType) {
      case 'contact':
        return {
          id: await this.updateContact(params as ContactUpdateParams),
        };
      case 'account':
        return { id: await this.updateAccount(params as AccountUpdateParams) };
      case 'sequence_step': {
        const p = params as EngagementCommonObjectTypeMap<'sequence_step'>['updateParams'];
        const seqTemplates = await this.#api
          .GET('/sequenceTemplates', {
            params: { query: { 'filter[sequenceStep][id]': p.sequence_step_id } },
          })
          .then((seqTemplatesRes) =>
            Promise.all(
              seqTemplatesRes.data.data?.map(async (seqTemplate) => ({
                ...seqTemplate,
                template: await this.#api
                  .GET('/templates/{id}', {
                    params: { path: { id: seqTemplate.relationships!.template!.data!.id! } },
                  })
                  .then((r) => r.data.data),
              })) ?? []
            )
          );
        const template = seqTemplates[0]?.template;

        if (!template) {
          throw new NotFoundError(`Sequence step ${p.sequence_step_id} does not have a template`);
        }
        await this.#api.PATCH('/templates/{id}', {
          params: { path: { id: template.id! } },
          body: {
            data: {
              id: template.id!,
              type: template.type!,
              attributes: { bodyHtml: p.template?.body, subject: p.template?.subject },
            },
          },
        });
        return { id: p.sequence_step_id };
      }
      default:
        throw new BadRequestError(`Update not supported for common object ${commonObjectType}`);
    }
  }

  async updateContact(params: ContactUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.patch<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/prospects/${params.id}`,
      toOutreachProspectUpdateParams(params),
      {
        headers: this.getAuthHeadersForPassthroughRequest(),
      }
    );
    return response.data.data.id.toString();
  }

  async updateAccount(params: AccountUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.patch<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/accounts/${params.id}`,
      toOutreachAccountUpdateParams(params),
      {
        headers: this.getAuthHeadersForPassthroughRequest(),
      }
    );
    return response.data.data.id.toString();
  }

  public override async listCommonObjectRecords<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['listParams']
  ): Promise<PaginatedSupaglueRecords<EngagementCommonObjectTypeMap<T>['object']>> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#listRecords<Contact>('/api/v2/prospects', fromOutreachProspectToContact, params);
      case 'user':
        return await this.#listRecords<User>('/api/v2/prospects', (r: any) => fromOutreachUserToUser(r), params);
      case 'sequence':
        return await this.#listRecords<Sequence>(
          '/api/v2/sequences',
          (r: any) => fromOutreachSequenceToSequence(r),
          params
        );
      case 'mailbox':
        return await this.#listRecords<Mailbox>(
          '/api/v2/mailboxes',
          (r: any) => fromOutreachMailboxToMailbox(r),
          params
        );
      case 'sequence_state':
        return await this.#listRecords<SequenceState>(
          '/api/v2/sequenceStates',
          fromOutreachSequenceStateToSequenceState,
          params
        );
      case 'account':
        return await this.#listRecords('/api/v2/accounts', fromOutreachAccountToAccount, params);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async #listRecords<T>(
    path: string,
    mapper: (record: OutreachRecord) => T,
    params: EngagementListParams
  ): Promise<PaginatedSupaglueRecords<T>> {
    const cursor = decodeCursor(params.cursor);
    const records = await this.#getListRecordsFetcher(
      `${this.#baseURL}${path}`,
      params.modifiedAfter,
      params.pageSize ?? DEFAULT_PAGE_SIZE
    )(cursor?.id as string | undefined);
    return {
      records: records.data.map(mapper),
      pagination: {
        total_count: records.meta.count,
        previous: records.links?.prev ? encodeCursor({ id: records.links?.prev, reverse: true }) : null,
        next: records.links?.next ? encodeCursor({ id: records.links?.next, reverse: false }) : null,
      },
    };
  }

  public override async searchCommonObjectRecords<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['searchParams']
  ): Promise<PaginatedSupaglueRecords<EngagementCommonObjectTypeMap<T>['object']>> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#searchContacts(params as ContactSearchParams);
      case 'sequence_state':
        return await this.#searchSequenceStates(params as SequenceStateSearchParams);
      case 'account':
        return await this.#searchAccounts(params as AccountSearchParams);
      case 'user':
      case 'mailbox':
      case 'sequence':
        throw new BadRequestError(`Search operation not supported for common object ${commonObjectType} in Outreach`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async #searchAccounts(params: AccountSearchParams): Promise<PaginatedSupaglueRecords<Account>> {
    if (!params.filter.name && !params.filter.domain) {
      throw new BadRequestError('Must specify at least one filter field');
    }
    const cursor = params.cursor ? decodeCursor(params.cursor) : undefined;
    const link = cursor?.id as string;
    const listParams: Record<string, unknown> = { 'page[size]': params.pageSize };
    if (params.filter.name) {
      listParams['filter[name]'] = params.filter.name;
    }
    if (params.filter.domain) {
      listParams['filter[domain]'] = params.filter.domain;
    }
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = link
        ? await axios.get<OutreachPaginatedRecords>(link, {
            headers: this.getAuthHeadersForPassthroughRequest(),
          })
        : await axios.get<OutreachPaginatedRecords>(`${this.#baseURL}/api/v2/accounts`, {
            params: listParams,
            headers: this.getAuthHeadersForPassthroughRequest(),
          });
      const records = response.data.data.map(fromOutreachAccountToAccount);
      return {
        records,
        pagination: {
          total_count: records.length,
          previous: response.data.links?.prev ? encodeCursor({ id: response.data.links?.prev, reverse: true }) : null,
          next: response.data.links?.next ? encodeCursor({ id: response.data.links?.next, reverse: false }) : null,
        },
      };
    });
  }

  async #searchContacts(params: ContactSearchParams): Promise<PaginatedSupaglueRecords<Contact>> {
    const cursor = params.cursor ? decodeCursor(params.cursor) : undefined;
    const link = cursor?.id as string;
    const listParams: Record<string, unknown> = { 'page[size]': params.pageSize ?? DEFAULT_PAGE_SIZE };
    if (params.filter.emails) {
      // Note this is implemented as an OR, not an AND
      listParams['filter[emails]'] = params.filter.emails.join(',');
    }
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = link
        ? await axios.get<OutreachPaginatedRecords>(link, {
            headers: this.getAuthHeadersForPassthroughRequest(),
          })
        : await axios.get<OutreachPaginatedRecords>(`${this.#baseURL}/api/v2/prospects`, {
            params: listParams,
            headers: this.getAuthHeadersForPassthroughRequest(),
          });
      const records = response.data.data.map(fromOutreachProspectToContact);
      return {
        records,
        pagination: {
          total_count: records.length,
          previous: response.data.links?.prev ? encodeCursor({ id: response.data.links?.prev, reverse: true }) : null,
          next: response.data.links?.next ? encodeCursor({ id: response.data.links?.next, reverse: false }) : null,
        },
      };
    });
  }

  async #searchSequenceStates(params: SequenceStateSearchParams): Promise<PaginatedSupaglueRecords<SequenceState>> {
    const cursor = params.cursor ? decodeCursor(params.cursor) : undefined;
    const link = cursor?.id as string;
    const listParams: Record<string, unknown> = {
      'page[size]': params.pageSize ?? DEFAULT_PAGE_SIZE,
    };
    // Note: if both are provided, it will be implemented as an AND.
    if (params.filter.contactId) {
      listParams['filter[prospect][id]'] = params.filter.contactId;
    }
    if (params.filter.sequenceId) {
      listParams['filter[sequence][id]'] = params.filter.sequenceId;
    }
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = link
        ? await axios.get<OutreachPaginatedRecords>(link, {
            headers: this.getAuthHeadersForPassthroughRequest(),
          })
        : await axios.get<OutreachPaginatedRecords>(`${this.#baseURL}/api/v2/sequenceStates`, {
            params: listParams,
            headers: this.getAuthHeadersForPassthroughRequest(),
          });
      const records = response.data.data.map(fromOutreachSequenceStateToSequenceState);
      return {
        records,
        pagination: {
          total_count: response.data.meta.count,
          previous: response.data.links?.prev ? encodeCursor({ id: response.data.links?.prev, reverse: true }) : null,
          next: response.data.links?.next ? encodeCursor({ id: response.data.links?.next, reverse: false }) : null,
        },
      };
    });
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }

  public override async handleErr(err: unknown): Promise<unknown> {
    if (!isAxiosError(err)) {
      return err;
    }

    // https://developers.outreach.io/api/making-requests/#error-responses
    // Outreach references jsonapi: https://jsonapi.org/format/#error-objects
    const jsonError = err.response?.data?.errors?.[0];
    const cause = err.response?.data;
    const status = err.response?.status;

    switch (status) {
      case 400:
        return new InternalServerError(jsonError?.title, { cause, origin: 'remote-provider', status });
      case 401:
        return new UnauthorizedError(jsonError?.title, { cause, origin: 'remote-provider', status });
      case 403:
        return new ForbiddenError(jsonError?.title, { cause, origin: 'remote-provider', status });
      case 404:
        return new NotFoundError(jsonError?.title, { cause, origin: 'remote-provider', status });
      case 409:
        return new ConflictError(jsonError?.title, { cause, origin: 'remote-provider', status });
      case 422:
        return new UnprocessableEntityError(jsonError?.title, { cause, origin: 'remote-provider', status });
      case 429:
        return new TooManyRequestsError(jsonError?.title, { cause, origin: 'remote-provider', status });
      // The following are unmapped to Supaglue errors, but we want to pass
      // them back as 4xx so they aren't 500 and developers can view error messages
      case 402:
      case 405:
      case 406:
      case 407:
      case 408:
      case 410:
      case 411:
      case 412:
      case 413:
      case 414:
      case 415:
      case 416:
      case 417:
      case 418:
      case 419:
      case 420:
      case 421:
      case 423:
      case 424:
      case 425:
      case 426:
      case 427:
      case 428:
      case 430:
      case 431:
      case 432:
      case 433:
      case 434:
      case 435:
      case 436:
      case 437:
      case 438:
      case 439:
      case 440:
      case 441:
      case 442:
      case 443:
      case 444:
      case 445:
      case 446:
      case 447:
      case 448:
      case 449:
      case 450:
      case 451:
        return new RemoteProviderError(jsonError?.title, { cause, status });
      default:
        return err;
    }
  }
}

export function newClient(connection: ConnectionUnsafe<'outreach'>, provider: Provider): OutreachClient {
  return new OutreachClient({
    ...connection.credentials,
    clientId: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.outreach.io',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://api.outreach.io',
  authorizePath: '/oauth/authorize',
};

function getUpdatedAfterPathParam(updatedAfter: Date) {
  // Outreach's updatedAt filter is inclusive, so we need to add 1 millisecond.
  const plusOneMs = new Date(updatedAfter.getTime() + 1);
  return {
    'filter[updatedAt]': `${plusOneMs.toISOString()}..inf`,
  };
}
