/**
 * Tests contacts endpoints
 *
 * @group integration/crm/v2/contacts
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateContactRequest,
  CreateContactResponse,
  GetContactResponse,
  UpdateContactResponse,
  UpsertContactRequest,
  UpsertContactResponse,
} from '@supaglue/schemas/v2/crm';

describe('contact', () => {
  const testContact: CreateContactRequest['record'] = {
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
    first_name: 'first',
    last_name: 'last',
  };

  describe.each(['salesforce', 'hubspot', 'pipedrive'])('%s', (providerName) => {
    test(`POST /`, async () => {
      const response = await apiClient.post<CreateContactResponse>(
        '/crm/v2/contacts',
        { record: testContact },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'contact',
      });

      const getResponse = await apiClient.get<GetContactResponse>(`/crm/v2/contacts/${response.data.record?.id}`, {
        headers: { 'x-provider-name': providerName },
      });

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.first_name).toEqual(testContact.first_name);
      expect(getResponse.data.last_name).toEqual(testContact.last_name);
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(getResponse.data.addresses).toEqual(testContact.record.addresses);

      // test that the db was updated
      const dbContact = await db.query(`SELECT * FROM crm_contacts WHERE id = $1`, [response.data.record?.id]);
      expect(dbContact.rows[0].first_name).toEqual(testContact.first_name);
      expect(dbContact.rows[0].last_name).toEqual(testContact.last_name);
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
    }, 120000);

    test('PATCH /', async () => {
      const response = await apiClient.post<CreateContactResponse>(
        '/crm/v2/contacts',
        { record: testContact },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();

      const updateResponse = await apiClient.patch<UpdateContactResponse>(
        `/crm/v2/contacts/${response.data.record?.id}`,
        {
          record: {
            first_name: 'updated',
            last_name: 'contact',
          },
        },
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(updateResponse.status).toEqual(200);

      const getResponse = await apiClient.get<GetContactResponse>(`/crm/v2/contacts/${response.data.record?.id}`, {
        headers: { 'x-provider-name': providerName },
      });
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.first_name).toEqual('updated');
      expect(getResponse.data.last_name).toEqual('contact');
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(getResponse.data.addresses).toEqual(testContact.record.addresses);

      // test that the db was updated
      const dbContact = await db.query(`SELECT * FROM crm_contacts WHERE id = $1`, [response.data.record?.id]);
      expect(dbContact.rows[0].first_name).toEqual('updated');
      expect(dbContact.rows[0].last_name).toEqual('contact');
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(dbContact.rows[0].addresses).toEqual(testContact.record.addresses);
    }, 120000);

    test(`POST /_upsert`, async () => {
      const email = `me@example${Math.random()}.com`;
      const testContactUpsert: UpsertContactRequest = {
        upsert_on: { key: 'email', values: [email] },
        record: { ...testContact, email_addresses: [{ email_address: email, email_address_type: 'primary' }] },
      };
      const response = await apiClient.post<UpsertContactResponse>('/crm/v2/contacts/_upsert', testContactUpsert, {
        headers: { 'x-provider-name': providerName },
      });

      expect(response.status).toEqual(200);
      expect(response.data.record?.id).toBeTruthy();
      addedObjects.push({
        id: response.data.record?.id as string,
        providerName,
        objectName: 'contact',
      });

      const getResponse = await apiClient.get<GetContactResponse>(`/crm/v2/contacts/${response.data.record?.id}`, {
        headers: { 'x-provider-name': providerName },
      });
      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.first_name).toEqual(testContact.first_name);
      expect(getResponse.data.last_name).toEqual(testContact.last_name);
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(getResponse.data.addresses).toEqual(testContact.addresses);

      // test that the db was updated
      const dbContact = await db.query(`SELECT * FROM crm_contacts WHERE id = $1`, [response.data.record?.id]);
      expect(dbContact.rows[0].first_name).toEqual(testContact.first_name);
      expect(dbContact.rows[0].last_name).toEqual(testContact.last_name);
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(dbContact.rows[0].addresses).toEqual(testContact.addresses);

      // sleep for 12 seconds to allow hubspot and pipedrive to update indexes
      if (providerName === 'hubspot' || providerName === 'pipedrive') {
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }

      const testContactUpsert2 = {
        upsert_on: { key: 'email', values: [email] },
        record: {
          first_name: 'updated',
          last_name: 'contact',
        },
      };
      const response2 = await apiClient.post<UpsertContactResponse>('/crm/v2/contacts/_upsert', testContactUpsert2, {
        headers: { 'x-provider-name': providerName },
      });
      expect(response2.status).toEqual(200);
      expect(response2.data.record?.id).toEqual(response.data.record?.id);

      const getResponse2 = await apiClient.get<GetContactResponse>(`/crm/v2/contacts/${response.data.record?.id}`, {
        headers: { 'x-provider-name': providerName },
      });
      expect(getResponse2.status).toEqual(200);
      expect(getResponse2.data.id).toEqual(response.data.record?.id);
      expect(getResponse2.data.first_name).toEqual('updated');
      expect(getResponse2.data.last_name).toEqual('contact');
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(getResponse2.data.addresses).toEqual(testContact.addresses);

      // test that the db was updated
      const dbContact2 = await db.query(`SELECT * FROM crm_contacts WHERE id = $1`, [response.data.record?.id]);
      expect(dbContact2.rows[0].first_name).toEqual('updated');
      expect(dbContact2.rows[0].last_name).toEqual('contact');
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(dbContact2.rows[0].addresses).toEqual(testContact.addresses);
    }, 120000);
  });
});
