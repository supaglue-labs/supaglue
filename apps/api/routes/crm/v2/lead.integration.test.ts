/**
 * Tests leads endpoints
 *
 * @group integration/crm/v2/leads
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateContactSuccessfulResponse,
  CreateLeadRequest,
  CreateLeadSuccessfulResponse,
  GetLeadSuccessfulResponse,
  ListLeadsSuccessfulResponse,
  SearchLeadsSuccessfulResponse,
  UpdateLeadSuccessfulResponse,
  UpsertLeadRequest,
  UpsertLeadSuccessfulResponse,
} from '@supaglue/schemas/v2/crm';

jest.retryTimes(3);

describe('lead', () => {
  // lead create / update / upsert not supported for hubspot
  describe.each(['salesforce', 'pipedrive', 'ms_dynamics_365_sales'])('%s', (providerName) => {
    let testLead: CreateLeadRequest['record'];
    beforeEach(() => {
      testLead = {
        first_name: Math.random().toString(36).substring(7),
        last_name: Math.random().toString(36).substring(7),
        company: Math.random().toString(36).substring(7),
        title: Math.random().toString(36).substring(7),
      };
    });

    test(`Test that POST followed by GET has correct data and properly cache invalidates`, async () => {
      // pipedrive needs a contact to convert to a lead first
      let convertedContactId = undefined;
      if (providerName === 'pipedrive') {
        const contactResponse = await apiClient.post<CreateContactSuccessfulResponse>(
          '/crm/v2/contacts',
          { record: { first_name: 'first', last_name: 'last' } },
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(contactResponse.status).toEqual(201);
        expect(contactResponse.data.record?.id).toBeTruthy();
        convertedContactId = contactResponse.data.record?.id;
        addedObjects.push({
          id: contactResponse.data.record?.id as string,
          providerName,
          objectName: 'contact',
        });
      }

      const response = await apiClient.post<CreateLeadSuccessfulResponse>(
        '/crm/v2/leads',
        { record: { ...testLead, converted_contact_id: convertedContactId } },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'lead',
      });

      const getResponse = await apiClient.get<GetLeadSuccessfulResponse>(`/crm/v2/leads/${response.data.record?.id}`, {
        headers: { 'x-provider-name': providerName },
      });

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      // pipedrive doesn't support first_name, last_name and company on leads
      if (providerName !== 'pipedrive') {
        expect(getResponse.data.first_name).toEqual(testLead.first_name);
        expect(getResponse.data.last_name).toEqual(testLead.last_name);
        expect(getResponse.data.company).toEqual(testLead.company);
      }
      expect(getResponse.data.title).toEqual(testLead.title);

      // test that the db was updated
      const cachedReadResponse = await apiClient.get<ListLeadsSuccessfulResponse>(
        `/crm/v2/leads?read_from_cache=true&modified_after=${encodeURIComponent(testStartTime.toISOString())}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(cachedReadResponse.status).toEqual(200);
      const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
      expect(found).toBeTruthy();
      // pipedrive doesn't support first_name, last_name and company on leads
      if (providerName !== 'pipedrive') {
        expect(found?.first_name).toEqual(testLead.first_name);
        expect(found?.last_name).toEqual(testLead.last_name);
        expect(found?.company).toEqual(testLead.company);
      }
      expect(found?.title).toEqual(testLead.title);
    }, 120000);

    test('PATCH then GET /', async () => {
      // pipedrive needs a contact to convert to a lead first
      let convertedContactId = undefined;
      if (providerName === 'pipedrive') {
        const contactResponse = await apiClient.post<CreateContactSuccessfulResponse>(
          '/crm/v2/contacts',
          { record: { first_name: 'first', last_name: 'last' } },
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(contactResponse.status).toEqual(201);
        expect(contactResponse.data.record?.id).toBeTruthy();
        convertedContactId = contactResponse.data.record?.id;
        addedObjects.push({
          id: contactResponse.data.record?.id as string,
          providerName,
          objectName: 'contact',
        });
      }

      const response = await apiClient.post<CreateLeadSuccessfulResponse>(
        '/crm/v2/leads',
        { record: { ...testLead, converted_contact_id: convertedContactId } },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'lead',
      });

      const updateResponse = await apiClient.patch<UpdateLeadSuccessfulResponse>(
        `/crm/v2/leads/${response.data.record?.id}`,
        {
          record: {
            first_name: 'updated',
            last_name: 'lead',
            title: 'new title',
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

      const getResponse = await apiClient.get<GetLeadSuccessfulResponse>(`/crm/v2/leads/${response.data.record?.id}`, {
        headers: { 'x-provider-name': providerName },
      });
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      // pipedrive doesn't support first_name, last_name and company on leads
      if (providerName !== 'pipedrive') {
        expect(getResponse.data.first_name).toEqual('updated');
        expect(getResponse.data.last_name).toEqual('lead');
        expect(getResponse.data.company).toEqual(testLead.company);
      }
      expect(getResponse.data.title).toEqual('new title');

      // test that the db was updated
      const cachedReadResponse = await apiClient.get<ListLeadsSuccessfulResponse>(
        `/crm/v2/leads?read_from_cache=true&modified_after=${encodeURIComponent(testStartTime.toISOString())}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(cachedReadResponse.status).toEqual(200);
      const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
      expect(found).toBeTruthy();
      // pipedrive doesn't support first_name, last_name and company on leads
      if (providerName !== 'pipedrive') {
        expect(found?.first_name).toEqual('updated');
        expect(found?.last_name).toEqual('lead');
        expect(found?.company).toEqual(testLead.company);
      }
      expect(found?.title).toEqual('new title');
    }, 120_000);

    // Search only supported for salesforce
    testIf(
      ['salesforce'].includes(providerName),
      `Test that POST followed by SEARCH has correct data`,
      async () => {
        const email = `me+${Math.random()}@example.com`;
        const response = await apiClient.post<CreateLeadSuccessfulResponse>(
          '/crm/v2/leads',
          { record: { ...testLead, email_addresses: [{ email_address: email, email_address_type: 'primary' }] } },
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(response.status).toEqual(201);
        expect(response.data.record?.id).toBeTruthy();
        addedObjects.push({
          id: response.data.record?.id as string,
          providerName,
          objectName: 'lead',
        });

        const searchResponse = await apiClient.post<SearchLeadsSuccessfulResponse>(
          `/crm/v2/leads/_search`,
          {
            filter: {
              email,
            },
          },
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(searchResponse.status).toEqual(200);
        expect(searchResponse.data.records.length).toEqual(1);
        expect(searchResponse.data.records[0].id).toEqual(response.data.record?.id);
      },
      120_000
    );

    testIf(
      // not supported for pipedrive or ms dynamics
      ['salesforce', 'hubspot'].includes(providerName),
      `Test upserting twice only creates 1 record and cache invalidates`,
      async () => {
        const email = `me@example${Math.random()}.com`;
        const testLeadUpsert: UpsertLeadRequest = {
          upsert_on: { key: 'email', values: [email] },
          record: { ...testLead, email_addresses: [{ email_address: email, email_address_type: 'primary' }] },
        };
        const response = await apiClient.post<UpsertLeadSuccessfulResponse>('/crm/v2/leads/_upsert', testLeadUpsert, {
          headers: { 'x-provider-name': providerName },
        });

        expect(response.status).toEqual(200);
        expect(response.data.record?.id).toBeTruthy();
        addedObjects.push({
          id: response.data.record?.id as string,
          providerName,
          objectName: 'lead',
        });

        const getResponse = await apiClient.get<GetLeadSuccessfulResponse>(
          `/crm/v2/leads/${response.data.record?.id}`,
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(getResponse.data.id).toEqual(response.data.record?.id);
        expect(getResponse.data.first_name).toEqual(testLead.first_name);
        expect(getResponse.data.last_name).toEqual(testLead.last_name);
        expect(getResponse.data.company).toEqual(testLead.company);
        expect(getResponse.data.title).toEqual(testLead.title);

        // test that the db was updated
        const cachedReadResponse = await apiClient.get<ListLeadsSuccessfulResponse>(
          `/crm/v2/leads?read_from_cache=true&modified_after=${encodeURIComponent(testStartTime.toISOString())}`,
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(cachedReadResponse.status).toEqual(200);
        const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
        expect(found).toBeTruthy();
        expect(found?.first_name).toEqual(testLead.first_name);
        expect(found?.last_name).toEqual(testLead.last_name);
        expect(found?.company).toEqual(testLead.company);
        expect(found?.title).toEqual(testLead.title);

        const testLeadUpsert2 = {
          upsert_on: { key: 'email', values: [email] },
          record: {
            first_name: 'updated',
            last_name: 'lead',
          },
        };
        const response2 = await apiClient.post<UpsertLeadSuccessfulResponse>('/crm/v2/leads/_upsert', testLeadUpsert2, {
          headers: { 'x-provider-name': providerName },
        });
        expect(response2.status).toEqual(200);
        expect(response2.data.record?.id).toEqual(response.data.record?.id);

        const getResponse2 = await apiClient.get<GetLeadSuccessfulResponse>(
          `/crm/v2/leads/${response.data.record?.id}`,
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(getResponse2.data.id).toEqual(response.data.record?.id);
        expect(getResponse2.data.first_name).toEqual('updated');
        expect(getResponse2.data.last_name).toEqual('lead');
        expect(getResponse2.data.company).toEqual(testLead.company);
        expect(getResponse2.data.title).toEqual(testLead.title);

        // test that the db was updated
        const cachedReadResponse2 = await apiClient.get<ListLeadsSuccessfulResponse>(
          `/crm/v2/leads?read_from_cache=true&modified_after=${encodeURIComponent(testStartTime.toISOString())}`,
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(cachedReadResponse2.status).toEqual(200);
        const found2 = cachedReadResponse2.data.records.find((r) => r.id === response.data.record?.id);
        expect(found2).toBeTruthy();
        expect(found2?.first_name).toEqual('updated');
        expect(found2?.last_name).toEqual('lead');
        expect(found2?.company).toEqual(testLead.company);
        expect(found2?.title).toEqual(testLead.title);
      },
      120_000
    );
  });
});
