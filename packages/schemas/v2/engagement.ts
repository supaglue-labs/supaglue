import type { operations, paths } from '../gen/v2/engagement';

export type SendPassthroughRequestPathParams = never;
export type SendPassthroughRequestQueryParams = Required<operations['getUser']>['parameters']['query'];
export type SendPassthroughRequestRequest =
  operations['sendPassthroughRequest']['requestBody']['content']['application/json'];
export type SendPassthroughRequestResponse =
  operations['sendPassthroughRequest']['responses'][keyof operations['sendPassthroughRequest']['responses']]['content']['application/json'];

export type CreateAccountPathParams = never;
export type CreateAccountQueryParams = never;
export type CreateAccountRequest = operations['createAccount']['requestBody']['content']['application/json'];
export type CreateAccountResponse =
  operations['createAccount']['responses'][keyof operations['createAccount']['responses']]['content']['application/json'];

export type ListAccountsPathParams = never;
export type ListAccountsQueryParams = Required<operations['listAccounts']>['parameters']['query'];
export type ListAccountsRequest = never;
export type ListAccountsResponse =
  operations['listAccounts']['responses'][keyof operations['listAccounts']['responses']]['content']['application/json'];

export type GetAccountPathParams = paths[`/accounts/{account_id}`]['parameters']['path'];
export type GetAccountQueryParams = Required<operations['getAccount']>['parameters']['query'];
export type GetAccountRequest = never;
export type GetAccountResponse =
  operations['getAccount']['responses'][keyof operations['getAccount']['responses']]['content']['application/json'];

export type UpdateAccountPathParams = paths[`/accounts/{account_id}`]['parameters']['path'];
export type UpdateAccountQueryParams = never;
export type UpdateAccountRequest = operations['updateAccount']['requestBody']['content']['application/json'];
export type UpdateAccountResponse =
  operations['updateAccount']['responses'][keyof operations['updateAccount']['responses']]['content']['application/json'];

export type CreateContactPathParams = never;
export type CreateContactQueryParams = never;
export type CreateContactRequest = operations['createContact']['requestBody']['content']['application/json'];
export type CreateContactResponse =
  operations['createContact']['responses'][keyof operations['createContact']['responses']]['content']['application/json'];

export type ListContactsPathParams = never;
export type ListContactsQueryParams = Required<operations['listContacts']>['parameters']['query'];
export type ListContactsRequest = never;
export type ListContactsResponse =
  operations['listContacts']['responses'][keyof operations['listContacts']['responses']]['content']['application/json'];

export type GetContactPathParams = paths[`/contacts/{contact_id}`]['parameters']['path'];
export type GetContactQueryParams = Required<operations['getContact']>['parameters']['query'];
export type GetContactRequest = never;
export type GetContactResponse =
  operations['getContact']['responses'][keyof operations['getContact']['responses']]['content']['application/json'];

export type UpdateContactPathParams = paths[`/contacts/{contact_id}`]['parameters']['path'];
export type UpdateContactQueryParams = never;
export type UpdateContactRequest = operations['updateContact']['requestBody']['content']['application/json'];
export type UpdateContactResponse =
  operations['updateContact']['responses'][keyof operations['updateContact']['responses']]['content']['application/json'];

export type GetUserPathParams = paths[`/users/{user_id}`]['parameters']['path'];
export type GetUserQueryParams = Required<operations['getUser']>['parameters']['query'];
export type GetUserRequest = never;
export type GetUserResponse =
  operations['getUser']['responses'][keyof operations['getUser']['responses']]['content']['application/json'];

export type ListUsersPathParams = never;
export type ListUsersQueryParams = Required<operations['listUsers']>['parameters']['query'];
export type ListUsersRequest = never;
export type ListUsersResponse =
  operations['listUsers']['responses'][keyof operations['listUsers']['responses']]['content']['application/json'];

export type GetSequencePathParams = paths[`/sequences/{sequence_id}`]['parameters']['path'];
export type GetSequenceQueryParams = Required<operations['getSequence']>['parameters']['query'];
export type GetSequenceRequest = never;
export type GetSequenceResponse =
  operations['getSequence']['responses'][keyof operations['getSequence']['responses']]['content']['application/json'];

export type ListSequencesPathParams = never;
export type ListSequencesQueryParams = Required<operations['listSequences']>['parameters']['query'];
export type ListSequencesRequest = never;
export type ListSequencesResponse =
  operations['listSequences']['responses'][keyof operations['listSequences']['responses']]['content']['application/json'];

export type CreateSequencePathParams = never;
export type CreateSequenceQueryParams = never;
export type CreateSequenceRequest = operations['createSequence']['requestBody']['content']['application/json'];
export type CreateSequenceResponse =
  operations['createSequence']['responses'][keyof operations['createSequence']['responses']]['content']['application/json'];

export type GetMailboxPathParams = paths[`/mailboxes/{mailbox_id}`]['parameters']['path'];
export type GetMailboxQueryParams = Required<operations['getMailbox']>['parameters']['query'];
export type GetMailboxRequest = never;
export type GetMailboxResponse =
  operations['getMailbox']['responses'][keyof operations['getMailbox']['responses']]['content']['application/json'];

export type ListMailboxesPathParams = never;
export type ListMailboxesQueryParams = Required<operations['listMailboxes']>['parameters']['query'];
export type ListMailboxesRequest = never;
export type ListMailboxesResponse =
  operations['listMailboxes']['responses'][keyof operations['listMailboxes']['responses']]['content']['application/json'];

export type GetSequenceStatePathParams = paths[`/sequence_states/{sequence_state_id}`]['parameters']['path'];
export type GetSequenceStateQueryParams = Required<operations['getSequenceState']>['parameters']['query'];
export type GetSequenceStateRequest = never;
export type GetSequenceStateResponse =
  operations['getSequenceState']['responses'][keyof operations['getSequenceState']['responses']]['content']['application/json'];

export type CreateSequenceStatePathParams = never;
export type CreateSequenceStateQueryParams = never;
export type CreateSequenceStateRequest =
  operations['createSequenceState']['requestBody']['content']['application/json'];
export type CreateSequenceStateResponse =
  operations['createSequenceState']['responses'][keyof operations['createSequenceState']['responses']]['content']['application/json'];

export type ListSequenceStatesPathParams = never;
export type ListSequenceStatesQueryParams = Required<operations['listSequenceStates']>['parameters']['query'];
export type ListSequenceStatesRequest = never;
export type ListSequenceStatesResponse =
  operations['listSequenceStates']['responses'][keyof operations['listSequenceStates']['responses']]['content']['application/json'];

export type BatchCreateSequenceStatePathParams = never;
export type BatchCreateSequenceStateQueryParams = never;
export type BatchCreateSequenceStateRequest =
  operations['batchCreateSequenceState']['requestBody']['content']['application/json'];
export type BatchCreateSequenceStateResponse =
  operations['batchCreateSequenceState']['responses'][keyof operations['batchCreateSequenceState']['responses']]['content']['application/json'];

export type CreateSequenceStepPathParams = paths[`/sequences/{sequence_id}/sequence_steps`]['parameters']['path'];
export type CreateSequenceStepQueryParams = never;
export type CreateSequenceStepRequest = operations['createSequenceStep']['requestBody']['content']['application/json'];
export type CreateSequenceStepResponse =
  operations['createSequenceStep']['responses'][keyof operations['createSequenceStep']['responses']]['content']['application/json'];
