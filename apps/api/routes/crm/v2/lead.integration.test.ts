/**
 * Tests leads endpoints
 *
 * @group integration/crm/v2/leads
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateContactResponse,
  CreateLeadRequest,
  CreateLeadResponse,
  GetLeadResponse,
  UpdateLeadResponse,
  UpsertLeadRequest,
  UpsertLeadResponse,
} from '@supaglue/schemas/v2/crm';

describe('lead', () => {
  // lead create / update / upsert not supported for hubspot
  describe.each(['salesforce', 'pipedrive'])('%s', (providerName) => {
    let testLead: CreateLeadRequest['record'];
    beforeEach(() => {
      testLead = {
        first_name: Math.random().toString(36).substring(7),
        last_name: Math.random().toString(36).substring(7),
        company: Math.random().toString(36).substring(7),
        title: Math.random().toString(36).substring(7),
      };
    });

    test(`POST /`, async () => {
      // pipedrive needs a contact to convert to a lead first
      let convertedContactId = undefined;
      if (providerName === 'pipedrive') {
        const contactResponse = await apiClient.post<CreateContactResponse>(
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

      const response = await apiClient.post<CreateLeadResponse>(
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

      const getResponse = await apiClient.get<GetLeadResponse>(`/crm/v2/leads/${response.data.record?.id}`, {
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
      const dbLead = await db.query('SELECT * FROM crm_leads WHERE id = $1', [response.data.record?.id]);
      // pipedrive doesn't support first_name, last_name and company on leads
      if (providerName !== 'pipedrive') {
        expect(dbLead.rows[0].first_name).toEqual(testLead.first_name);
        expect(dbLead.rows[0].last_name).toEqual(testLead.last_name);
        expect(dbLead.rows[0].company).toEqual(testLead.company);
      }
      expect(dbLead.rows[0].title).toEqual(testLead.title);
    }, 120000);

    test('PATCH /', async () => {
      // pipedrive needs a contact to convert to a lead first
      let convertedContactId = undefined;
      if (providerName === 'pipedrive') {
        const contactResponse = await apiClient.post<CreateContactResponse>(
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

      const response = await apiClient.post<CreateLeadResponse>(
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

      const updateResponse = await apiClient.patch<UpdateLeadResponse>(
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

      const getResponse = await apiClient.get<GetLeadResponse>(`/crm/v2/leads/${response.data.record?.id}`, {
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
      const dbLead = await db.query('SELECT * FROM crm_leads WHERE id = $1', [response.data.record?.id]);
      // pipedrive doesn't support first_name, last_name and company on leads
      if (providerName !== 'pipedrive') {
        expect(dbLead.rows[0].first_name).toEqual('updated');
        expect(dbLead.rows[0].last_name).toEqual('lead');
        expect(dbLead.rows[0].company).toEqual(testLead.company);
      }
      expect(dbLead.rows[0].title).toEqual('new title');
    }, 120000);

    testIf(
      // not supported for pipedrive
      !['pipedrive'].includes(providerName),
      `POST /_upsert`,
      async () => {
        const email = `me@example${Math.random()}.com`;
        const testLeadUpsert: UpsertLeadRequest = {
          upsert_on: { key: 'email', values: [email] },
          record: { ...testLead, email_addresses: [{ email_address: email, email_address_type: 'primary' }] },
        };
        const response = await apiClient.post<UpsertLeadResponse>('/crm/v2/leads/_upsert', testLeadUpsert, {
          headers: { 'x-provider-name': providerName },
        });

        expect(response.status).toEqual(200);
        expect(response.data.record?.id).toBeTruthy();
        addedObjects.push({
          id: response.data.record?.id as string,
          providerName,
          objectName: 'lead',
        });

        const getResponse = await apiClient.get<GetLeadResponse>(`/crm/v2/leads/${response.data.record?.id}`, {
          headers: { 'x-provider-name': providerName },
        });
        expect(getResponse.data.id).toEqual(response.data.record?.id);
        expect(getResponse.data.first_name).toEqual(testLead.first_name);
        expect(getResponse.data.last_name).toEqual(testLead.last_name);
        expect(getResponse.data.company).toEqual(testLead.company);
        expect(getResponse.data.title).toEqual(testLead.title);

        // test that the db was updated
        const dbLead = await db.query('SELECT * FROM crm_leads WHERE id = $1', [response.data.record?.id]);
        expect(dbLead.rows[0].first_name).toEqual(testLead.first_name);
        expect(dbLead.rows[0].last_name).toEqual(testLead.last_name);
        expect(dbLead.rows[0].company).toEqual(testLead.company);
        expect(dbLead.rows[0].title).toEqual(testLead.title);

        const testLeadUpsert2 = {
          upsert_on: { key: 'email', values: [email] },
          record: {
            first_name: 'updated',
            last_name: 'lead',
          },
        };
        const response2 = await apiClient.post<UpsertLeadResponse>('/crm/v2/leads/_upsert', testLeadUpsert2, {
          headers: { 'x-provider-name': providerName },
        });
        expect(response2.status).toEqual(200);
        expect(response2.data.record?.id).toEqual(response.data.record?.id);

        const getResponse2 = await apiClient.get<GetLeadResponse>(`/crm/v2/leads/${response.data.record?.id}`, {
          headers: { 'x-provider-name': providerName },
        });
        expect(getResponse2.data.id).toEqual(response.data.record?.id);
        expect(getResponse2.data.first_name).toEqual('updated');
        expect(getResponse2.data.last_name).toEqual('lead');
        expect(getResponse2.data.company).toEqual(testLead.company);
        expect(getResponse2.data.title).toEqual(testLead.title);

        // test that the db was updated
        const dbLead2 = await db.query('SELECT * FROM crm_leads WHERE id = $1', [response.data.record?.id]);
        expect(dbLead2.rows[0].first_name).toEqual('updated');
        expect(dbLead2.rows[0].last_name).toEqual('lead');
        expect(dbLead2.rows[0].company).toEqual(testLead.company);
        expect(dbLead2.rows[0].title).toEqual(testLead.title);
      },
      120000
    );
  });
});
