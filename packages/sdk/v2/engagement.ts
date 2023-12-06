import type { operations, paths } from '../gen/v2/engagement';

export type CreateAccountPathParams = never;
export type CreateAccountQueryParams = never;
export type CreateAccountRequest = operations['createAccount']['requestBody']['content']['application/json'];
export type CreateAccountResponse =
  operations['createAccount']['responses'][keyof operations['createAccount']['responses']]['content']['application/json'];
export type CreateAccountSuccessfulResponse =
  operations['createAccount']['responses']['201']['content']['application/json'];
export type CreateAccountFailureResponse = Exclude<CreateAccountResponse, CreateAccountSuccessfulResponse>;

export type UpsertAccountPathParams = never;
export type UpsertAccountQueryParams = never;
export type UpsertAccountRequest = operations['upsertAccount']['requestBody']['content']['application/json'];
export type UpsertAccountResponse =
  operations['upsertAccount']['responses'][keyof operations['upsertAccount']['responses']]['content']['application/json'];
export type UpsertAccountSuccessfulResponse =
  operations['upsertAccount']['responses']['201']['content']['application/json'];
export type UpsertAccountFailureResponse = Exclude<UpsertAccountResponse, UpsertAccountSuccessfulResponse>;

export type SearchAccountsPathParams = never;
export type SearchAccountsQueryParams = Required<operations['searchAccounts']>['parameters']['query'];
export type SearchAccountsRequest = operations['searchAccounts']['requestBody']['content']['application/json'];
export type SearchAccountsResponse =
  operations['searchAccounts']['responses'][keyof operations['searchAccounts']['responses']]['content']['application/json'];

export type ListAccountsPathParams = never;
export type ListAccountsQueryParams = Required<operations['listAccounts']>['parameters']['query'];
export type ListAccountsRequest = never;
export type ListAccountsResponse =
  operations['listAccounts']['responses'][keyof operations['listAccounts']['responses']]['content']['application/json'];
export type ListAccountsSuccessfulResponse =
  operations['listAccounts']['responses']['200']['content']['application/json'];
export type ListAccountsFailureResponse = Exclude<ListAccountsResponse, ListAccountsSuccessfulResponse>;

export type GetAccountPathParams = paths[`/accounts/{account_id}`]['parameters']['path'];
export type GetAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type GetAccountRequest = never;
export type GetAccountResponse =
  operations['getAccount']['responses'][keyof operations['getAccount']['responses']]['content']['application/json'];
export type GetAccountSuccessfulResponse = operations['getAccount']['responses']['200']['content']['application/json'];
export type GetAccountFailureResponse = Exclude<GetAccountResponse, GetAccountSuccessfulResponse>;

export type UpdateAccountPathParams = paths[`/accounts/{account_id}`]['parameters']['path'];
export type UpdateAccountQueryParams = never;
export type UpdateAccountRequest = operations['updateAccount']['requestBody']['content']['application/json'];
export type UpdateAccountResponse =
  operations['updateAccount']['responses'][keyof operations['updateAccount']['responses']]['content']['application/json'];
export type UpdateAccountSuccessfulResponse =
  operations['updateAccount']['responses']['200']['content']['application/json'];
export type UpdateAccountFailureResponse = Exclude<UpdateAccountResponse, UpdateAccountSuccessfulResponse>;

export type CreateContactPathParams = never;
export type CreateContactQueryParams = never;
export type CreateContactRequest = operations['createContact']['requestBody']['content']['application/json'];
export type CreateContactResponse =
  operations['createContact']['responses'][keyof operations['createContact']['responses']]['content']['application/json'];
export type CreateContactSuccessfulResponse =
  operations['createContact']['responses']['201']['content']['application/json'];
export type CreateContactFailureResponse = Exclude<CreateContactResponse, CreateContactSuccessfulResponse>;

export type SearchContactsPathParams = never;
export type SearchContactsQueryParams = Required<operations['searchContacts']>['parameters']['query'];
export type SearchContactsRequest = operations['searchContacts']['requestBody']['content']['application/json'];
export type SearchContactsResponse =
  operations['searchContacts']['responses'][keyof operations['searchContacts']['responses']]['content']['application/json'];
export type SearchContactsSuccessfulResponse =
  operations['searchContacts']['responses']['200']['content']['application/json'];
export type SearchContactsFailureResponse = Exclude<SearchContactsResponse, SearchContactsSuccessfulResponse>;

export type ListContactsPathParams = never;
export type ListContactsQueryParams = Required<operations['listContacts']>['parameters']['query'];
export type ListContactsRequest = never;
export type ListContactsResponse =
  operations['listContacts']['responses'][keyof operations['listContacts']['responses']]['content']['application/json'];
export type ListContactsSuccessfulResponse =
  operations['listContacts']['responses']['200']['content']['application/json'];
export type ListContactsFailureResponse = Exclude<ListContactsResponse, ListContactsSuccessfulResponse>;

export type GetContactPathParams = paths[`/contacts/{contact_id}`]['parameters']['path'];
export type GetContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type GetContactRequest = never;
export type GetContactResponse =
  operations['getContact']['responses'][keyof operations['getContact']['responses']]['content']['application/json'];
export type GetContactSuccessfulResponse = operations['getContact']['responses']['200']['content']['application/json'];
export type GetContactFailureResponse = Exclude<GetContactResponse, GetContactSuccessfulResponse>;

export type UpdateContactPathParams = paths[`/contacts/{contact_id}`]['parameters']['path'];
export type UpdateContactQueryParams = never;
export type UpdateContactRequest = operations['updateContact']['requestBody']['content']['application/json'];
export type UpdateContactResponse =
  operations['updateContact']['responses'][keyof operations['updateContact']['responses']]['content']['application/json'];
export type UpdateContactSuccessfulResponse =
  operations['updateContact']['responses']['200']['content']['application/json'];
export type UpdateContactFailureResponse = Exclude<UpdateContactResponse, UpdateContactSuccessfulResponse>;

export type GetUserPathParams = paths[`/users/{user_id}`]['parameters']['path'];
export type GetUserQueryParams = Required<operations['getUser']>['parameters']['query'];
export type GetUserRequest = never;
export type GetUserResponse =
  operations['getUser']['responses'][keyof operations['getUser']['responses']]['content']['application/json'];
export type GetUserSuccessfulResponse = operations['getUser']['responses']['200']['content']['application/json'];
export type GetUserFailureResponse = Exclude<GetUserResponse, GetUserSuccessfulResponse>;

export type ListUsersPathParams = never;
export type ListUsersQueryParams = Required<operations['listUsers']>['parameters']['query'];
export type ListUsersRequest = never;
export type ListUsersResponse =
  operations['listUsers']['responses'][keyof operations['listUsers']['responses']]['content']['application/json'];
export type ListUsersSuccessfulResponse = operations['listUsers']['responses']['200']['content']['application/json'];
export type ListUsersFailureResponse = Exclude<ListUsersResponse, ListUsersSuccessfulResponse>;

export type GetSequencePathParams = paths[`/sequences/{sequence_id}`]['parameters']['path'];
export type GetSequenceQueryParams = Required<operations['getSequence']>['parameters']['query'];
export type GetSequenceRequest = never;
export type GetSequenceResponse =
  operations['getSequence']['responses'][keyof operations['getSequence']['responses']]['content']['application/json'];
export type GetSequenceSuccessfulResponse =
  operations['getSequence']['responses']['200']['content']['application/json'];
export type GetSequenceFailureResponse = Exclude<GetSequenceResponse, GetSequenceSuccessfulResponse>;

export type ListSequencesPathParams = never;
export type ListSequencesQueryParams = Required<operations['listSequences']>['parameters']['query'];
export type ListSequencesRequest = never;
export type ListSequencesResponse =
  operations['listSequences']['responses'][keyof operations['listSequences']['responses']]['content']['application/json'];
export type ListSequencesSuccessfulResponse =
  operations['listSequences']['responses']['200']['content']['application/json'];
export type ListSequencesFailureResponse = Exclude<ListSequencesResponse, ListSequencesSuccessfulResponse>;

export type CreateSequencePathParams = never;
export type CreateSequenceQueryParams = never;
export type CreateSequenceRequest = operations['createSequence']['requestBody']['content']['application/json'];
export type CreateSequenceResponse =
  operations['createSequence']['responses'][keyof operations['createSequence']['responses']]['content']['application/json'];
export type CreateSequenceSuccessfulResponse =
  operations['createSequence']['responses']['201']['content']['application/json'];
export type CreateSequenceFailureResponse = Exclude<CreateSequenceResponse, CreateSequenceSuccessfulResponse>;

export type GetMailboxPathParams = paths[`/mailboxes/{mailbox_id}`]['parameters']['path'];
export type GetMailboxQueryParams = Required<operations['getMailbox']>['parameters']['query'];
export type GetMailboxRequest = never;
export type GetMailboxResponse =
  operations['getMailbox']['responses'][keyof operations['getMailbox']['responses']]['content']['application/json'];
export type GetMailboxSuccessfulResponse = operations['getMailbox']['responses']['200']['content']['application/json'];
export type GetMailboxFailureResponse = Exclude<GetMailboxResponse, GetMailboxSuccessfulResponse>;

export type ListMailboxesPathParams = never;
export type ListMailboxesQueryParams = Required<operations['listMailboxes']>['parameters']['query'];
export type ListMailboxesRequest = never;
export type ListMailboxesResponse =
  operations['listMailboxes']['responses'][keyof operations['listMailboxes']['responses']]['content']['application/json'];
export type ListMailboxesSuccessfulResponse =
  operations['listMailboxes']['responses']['200']['content']['application/json'];
export type ListMailboxesFailureResponse = Exclude<ListMailboxesResponse, ListMailboxesSuccessfulResponse>;

export type GetSequenceStatePathParams = paths[`/sequence_states/{sequence_state_id}`]['parameters']['path'];
export type GetSequenceStateQueryParams = Required<operations['getSequenceState']>['parameters']['query'];
export type GetSequenceStateRequest = never;
export type GetSequenceStateResponse =
  operations['getSequenceState']['responses'][keyof operations['getSequenceState']['responses']]['content']['application/json'];
export type GetSequenceStateSuccessfulResponse =
  operations['getSequenceState']['responses']['200']['content']['application/json'];
export type GetSequenceStateFailureResponse = Exclude<GetSequenceStateResponse, GetSequenceStateSuccessfulResponse>;

export type CreateSequenceStatePathParams = never;
export type CreateSequenceStateQueryParams = never;
export type CreateSequenceStateRequest =
  operations['createSequenceState']['requestBody']['content']['application/json'];
export type CreateSequenceStateResponse =
  operations['createSequenceState']['responses'][keyof operations['createSequenceState']['responses']]['content']['application/json'];
export type CreateSequenceStateSuccessfulResponse =
  operations['createSequenceState']['responses']['201']['content']['application/json'];
export type CreateSequenceStateFailureResponse = Exclude<
  CreateSequenceStateResponse,
  CreateSequenceStateSuccessfulResponse
>;

export type ListSequenceStatesPathParams = never;
export type ListSequenceStatesQueryParams = Required<operations['listSequenceStates']>['parameters']['query'];
export type ListSequenceStatesRequest = never;
export type ListSequenceStatesResponse =
  operations['listSequenceStates']['responses'][keyof operations['listSequenceStates']['responses']]['content']['application/json'];
export type ListSequenceStatesSuccessfulResponse =
  operations['listSequenceStates']['responses']['200']['content']['application/json'];
export type ListSequenceStatesFailureResponse = Exclude<
  ListSequenceStatesResponse,
  ListSequenceStatesSuccessfulResponse
>;

export type SearchSequenceStatesPathParams = never;
export type SearchSequenceStatesQueryParams = Required<operations['searchSequenceStates']>['parameters']['query'];
export type SearchSequenceStatesRequest =
  operations['searchSequenceStates']['requestBody']['content']['application/json'];
export type SearchSequenceStatesResponse =
  operations['searchSequenceStates']['responses'][keyof operations['searchSequenceStates']['responses']]['content']['application/json'];
export type SearchSequenceStatesSuccessfulResponse =
  operations['searchSequenceStates']['responses']['200']['content']['application/json'];
export type SearchSequenceStatesFailureResponse = Exclude<
  SearchSequenceStatesResponse,
  SearchSequenceStatesSuccessfulResponse
>;

export type BatchCreateSequenceStatePathParams = never;
export type BatchCreateSequenceStateQueryParams = never;
export type BatchCreateSequenceStateRequest =
  operations['batchCreateSequenceState']['requestBody']['content']['application/json'];
export type BatchCreateSequenceStateResponse =
  operations['batchCreateSequenceState']['responses'][keyof operations['batchCreateSequenceState']['responses']]['content']['application/json'];
export type BatchCreateSequenceStateSuccessfulResponse =
  operations['batchCreateSequenceState']['responses']['201']['content']['application/json'];
export type BatchCreateSequenceStateFailureResponse = Exclude<
  BatchCreateSequenceStateResponse,
  BatchCreateSequenceStateSuccessfulResponse
>;

export type CreateSequenceStepPathParams = paths[`/sequences/{sequence_id}/sequence_steps`]['parameters']['path'];
export type CreateSequenceStepQueryParams = never;
export type CreateSequenceStepRequest = operations['createSequenceStep']['requestBody']['content']['application/json'];
export type CreateSequenceStepResponse =
  operations['createSequenceStep']['responses'][keyof operations['createSequenceStep']['responses']]['content']['application/json'];
export type CreateSequenceStepSuccessfulResponse =
  operations['createSequenceStep']['responses']['201']['content']['application/json'];
export type CreateSequenceStepFailureResponse = Exclude<
  CreateSequenceStepResponse,
  CreateSequenceStepSuccessfulResponse
>;

export type EngagementV2Paths = paths;

export type EngagementV2 = {
  paths: paths;
  operations: operations;
};
