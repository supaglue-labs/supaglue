/**
 * Tests accounts endpoints
 *
 * @group integration/engagement/v2/accounts
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateAccountRequest,
  CreateAccountSuccessfulResponse,
  GetAccountSuccessfulResponse,
  ListAccountsSuccessfulResponse,
  UpdateAccountSuccessfulResponse,
  UpsertAccountSuccessfulResponse,
} from '@supaglue/sdk/v2/engagement';

describe('account', () => {
  let testAccount: CreateAccountRequest['record'];

  beforeEach(() => {
    testAccount = {
      name: Math.random().toString(),
      domain: `test${Math.random().toString()}.com`,
    };
  });

  describe.each(['outreach', 'salesloft'])('%s', (providerName) => {
    test(`Test that POST followed by GET has correct data and properly cache invalidates`, async () => {
      const response = await apiClient.post<CreateAccountSuccessfulResponse>(
        '/engagement/v2/accounts',
        { record: testAccount },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'account',
      });

      const getResponse = await apiClient.get<GetAccountSuccessfulResponse>(
        `/engagement/v2/accounts/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual(testAccount.name);

      // test that the db was updated
      const cachedReadResponse = await apiClient.get<ListAccountsSuccessfulResponse>(
        `/engagement/v2/accounts?read_from_cache=true&modified_after=${encodeURIComponent(
          testStartTime.toISOString()
        )}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(cachedReadResponse.status).toEqual(200);
      const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
      expect(found).toBeTruthy();
      expect(found?.name).toEqual(testAccount.name);
      expect(found?.domain).toEqual(testAccount.domain);
    }, 120_000);

    test('Test that 2 identical upserts only creates 1 record', async () => {
      const response = await apiClient.post<UpsertAccountSuccessfulResponse>(
        '/engagement/v2/accounts/_upsert',
        {
          record: testAccount,
          upsert_on: {
            name: testAccount.name,
            domain: testAccount.domain,
          },
        },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'account',
      });

      const response2 = await apiClient.post<UpsertAccountSuccessfulResponse>(
        '/engagement/v2/accounts/_upsert',
        {
          record: testAccount,
          upsert_on: {
            name: testAccount.name,
            domain: testAccount.domain,
          },
        },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response2.status).toEqual(201);
      expect(response2.data.record?.id).toBeTruthy();
      expect(response2.data.record?.id).toEqual(response.data.record?.id);
    }, 120_000);

    test('Test that POST followed by PATCH followed by GET has correct data and cache invalidates', async () => {
      const response = await apiClient.post<CreateAccountSuccessfulResponse>(
        '/engagement/v2/accounts',
        { record: testAccount },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'account',
      });

      const updateResponse = await apiClient.patch<UpdateAccountSuccessfulResponse>(
        `/engagement/v2/accounts/${response.data.record?.id}`,
        {
          record: {
            name: 'updated account',
          },
        },
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(updateResponse.status).toEqual(200);

      const getResponse = await apiClient.get<GetAccountSuccessfulResponse>(
        `/engagement/v2/accounts/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual('updated account');
      expect(getResponse.data.domain).toEqual(testAccount.domain);

      // test that the db was updated
      const cachedReadResponse = await apiClient.get<ListAccountsSuccessfulResponse>(
        `/engagement/v2/accounts?read_from_cache=true&modified_after=${encodeURIComponent(
          testStartTime.toISOString()
        )}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(cachedReadResponse.status).toEqual(200);
      const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
      expect(found).toBeTruthy();
      expect(found?.name).toEqual('updated account');
      expect(found?.domain).toEqual(testAccount.domain);
    }, 120_000);
  });
});
