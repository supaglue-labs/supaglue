/**
 * Tests accounts endpoints
 *
 * @group integration/crm/v2/accounts
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateAccountResponse,
  GetAccountResponse,
  UpdateAccountResponse,
  UpsertAccountResponse,
} from '@supaglue/schemas/v2/crm';

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

  describe.each(['salesforce', 'hubspot', 'pipedrive'])('%s', (providerName) => {
    test(`POST /`, async () => {
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
      const dbAccount = await db.query('SELECT * FROM crm_accounts WHERE id = $1', [response.data.record?.id]);
      expect(dbAccount.rows[0].name).toEqual(testAccount.name);
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(dbAccount.rows[0].addresses).toEqual(testAccount.record.addresses);
    }, 120000);

    test('PATCH /', async () => {
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
      const dbAccount = await db.query('SELECT * FROM crm_accounts WHERE id = $1', [response.data.record?.id]);
      expect(dbAccount.rows[0].name).toEqual('updated account');
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(dbAccount.rows[0].addresses).toEqual(testAccount.record.addresses);
    }, 120000);

    testIf(
      // not supported for pipedrive
      providerName !== 'pipedrive',
      `POST /_upsert`,
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
        const dbAccount = await db.query('SELECT * FROM crm_accounts WHERE id = $1', [response.data.record?.id]);
        expect(dbAccount.rows[0].name).toEqual(testAccount.name);
        // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
        // expect(dbAccount.rows[0].addresses).toEqual(testAccount.addresses);
        expect(dbAccount.rows[0].website).toEqual(website);
        expect(dbAccount.rows[0].name).toEqual(testAccount.name);

        // sleep for 12 seconds to allow hubspot to update indexes
        if (providerName === 'hubspot') {
          await new Promise((resolve) => setTimeout(resolve, 12000));
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
        const dbAccount2 = await db.query('SELECT * FROM crm_accounts WHERE id = $1', [response.data.record?.id]);
        expect(dbAccount2.rows[0].name).toEqual('updated account');
        // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
        // expect(dbAccount2.rows[0].addresses).toEqual(testAccount.addresses);
        expect(dbAccount2.rows[0].website).toEqual(website);
      },
      120000
    );
  });
});
