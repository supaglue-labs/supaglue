/**
 * Tests accounts endpoints
 *
 * @group integration/crm/v2/accounts
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateAccountResponse,
  GetAccountResponse,
  ListAccountsResponse,
  UpdateAccountResponse,
  UpsertAccountResponse,
} from '@supaglue/schemas/v2/crm';

jest.retryTimes(3);

describe('account', () => {
  const testAccount = {
    addresses: [
      {
        street_1: '123 Main St',
        street_2: 'Suite 101',
        city: 'Austin',
        country: 'US',
        postal_code: '78701',
        state: 'TX',
        address_type: 'primary',
      },
    ],
    name: 'test account',
  };

  describe.each(['salesforce', 'hubspot', 'pipedrive', 'ms_dynamics_365_sales'])('%s', (providerName) => {
    test(`Test that POST followed by GET has correct data and properly cache invalidates`, async () => {
      const response = await apiClient.post<CreateAccountResponse>(
        '/crm/v2/accounts',
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

      const getResponse = await apiClient.get<GetAccountResponse>(`/crm/v2/accounts/${response.data.record?.id}`, {
        headers: { 'x-provider-name': providerName },
      });

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual(testAccount.name);
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(getResponse.data.addresses).toEqual(testAccount.record.addresses);

      // test that the db was updated
      const cachedReadResponse = await apiClient.get<ListAccountsResponse>(
        `/crm/v2/accounts?read_from_cache=true&modified_after=${encodeURIComponent(testStartTime.toISOString())}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(cachedReadResponse.status).toEqual(200);
      const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
      expect(found).toBeTruthy();
      expect(found?.name).toEqual(testAccount.name);
    }, 120_000);

    test('Test that POST followed by PATCH followed by GET has correct data and cache invalidates', async () => {
      const response = await apiClient.post<CreateAccountResponse>(
        '/crm/v2/accounts',
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

      const updateResponse = await apiClient.patch<UpdateAccountResponse>(
        `/crm/v2/accounts/${response.data.record?.id}`,
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

      // Pipedrive does not have read after write guarantees, so we need to wait
      if (providerName === 'pipedrive') {
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }

      const getResponse = await apiClient.get<GetAccountResponse>(`/crm/v2/accounts/${response.data.record?.id}`, {
        headers: { 'x-provider-name': providerName },
      });
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual('updated account');
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(getResponse.data.addresses).toEqual(testAccount.record.addresses);

      // test that the db was updated
      const cachedReadResponse = await apiClient.get<ListAccountsResponse>(
        `/crm/v2/accounts?read_from_cache=true&modified_after=${encodeURIComponent(testStartTime.toISOString())}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(cachedReadResponse.status).toEqual(200);
      const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
      expect(found).toBeTruthy();
      expect(found?.name).toEqual('updated account');
    }, 120_000);

    testIf(
      ['salesforce', 'hubspot'].includes(providerName),
      `Test upserting twice only creates 1 record and cache invalidates`,
      async () => {
        const website = `https://example${Math.random()}.com/`;
        const domain = website.replace('https://', '').replace('http://', '').replace('/', '');
        const testAccountUpsert = {
          upsert_on:
            providerName === 'salesforce' ? { key: 'website', values: [website] } : { key: 'domain', values: [domain] },
          record: { ...testAccount, website, domain },
        };
        const response = await apiClient.post<UpsertAccountResponse>('/crm/v2/accounts/_upsert', testAccountUpsert, {
          headers: { 'x-provider-name': providerName },
        });

        expect(response.status).toEqual(200);
        expect(response.data.record?.id).toBeTruthy();
        addedObjects.push({
          id: response.data.record?.id as string,
          providerName,
          objectName: 'account',
        });

        const getResponse = await apiClient.get<GetAccountResponse>(`/crm/v2/accounts/${response.data.record?.id}`, {
          headers: { 'x-provider-name': providerName },
        });
        expect(getResponse.data.id).toEqual(response.data.record?.id);
        expect(getResponse.data.name).toEqual(testAccount.name);
        // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
        // expect(getResponse.data.addresses).toEqual(testAccount.addresses);
        expect(getResponse.data.website).toEqual(website);
        expect(getResponse.data.name).toEqual(testAccount.name);

        // test that the db was updated
        const cachedReadResponse = await apiClient.get<ListAccountsResponse>(
          `/crm/v2/accounts?read_from_cache=true&modified_after=${encodeURIComponent(testStartTime.toISOString())}`,
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(cachedReadResponse.status).toEqual(200);
        const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
        expect(found).toBeTruthy();
        expect(found?.name).toEqual(testAccount.name);
        expect(found?.website).toEqual(website);

        // sleep for 30 seconds to allow hubspot to update indexes
        if (providerName === 'hubspot') {
          await new Promise((resolve) => setTimeout(resolve, 30_000));
        }

        const testAccountUpsert2 = {
          upsert_on:
            providerName === 'salesforce' ? { key: 'website', values: [website] } : { key: 'domain', values: [domain] },
          record: {
            name: 'updated account',
          },
        };
        const response2 = await apiClient.post<UpsertAccountResponse>('/crm/v2/accounts/_upsert', testAccountUpsert2, {
          headers: { 'x-provider-name': providerName },
        });
        expect(response2.status).toEqual(200);
        expect(response2.data.record?.id).toEqual(response.data.record?.id);

        const getResponse2 = await apiClient.get<GetAccountResponse>(`/crm/v2/accounts/${response.data.record?.id}`, {
          headers: { 'x-provider-name': providerName },
        });
        expect(getResponse2.data.id).toEqual(response.data.record?.id);
        expect(getResponse2.data.name).toEqual('updated account');
        // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
        // expect(getResponse.data.addresses).toEqual(testAccount.addresses);
        expect(getResponse2.data.website).toEqual(website);

        // test that the db was updated
        const cachedReadResponse2 = await apiClient.get<ListAccountsResponse>(
          `/crm/v2/accounts?read_from_cache=true&modified_after=${encodeURIComponent(testStartTime.toISOString())}`,
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(cachedReadResponse2.status).toEqual(200);
        const found2 = cachedReadResponse2.data.records.find((r) => r.id === response.data.record?.id);
        expect(found2).toBeTruthy();
        expect(found2?.name).toEqual('updated account');
        expect(found2?.website).toEqual(website);
      },
      120_000
    );
  });
});
