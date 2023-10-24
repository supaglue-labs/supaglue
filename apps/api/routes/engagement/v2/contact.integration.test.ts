/**
 * Tests contacts endpoints
 *
 * @group integration/engagement/v2/contacts
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateContactRequest,
  CreateContactResponse,
  GetContactResponse,
  UpdateContactResponse,
} from '@supaglue/schemas/v2/engagement';

describe('contact', () => {
  let testContact: CreateContactRequest['record'];
  beforeEach(async () => {
    testContact = {
      first_name: `first ${Math.random().toString()}`,
      last_name: `last ${Math.random().toString()}`,
      job_title: 'job title',
      email_addresses: [
        {
          email_address: `test${Math.random().toString()}@mydomain.com`,
          email_address_type: 'primary',
        },
      ],
    };
  });

  describe.each(['outreach', 'apollo', 'salesloft'])('%s', (providerName) => {
    test(`POST /`, async () => {
      const response = await apiClient.post<CreateContactResponse>(
        '/engagement/v2/contacts',
        { record: testContact },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();

      // TODO get not supported for apollo
      if (providerName === 'apollo') {
        return;
      }
      const getResponse = await apiClient.get<GetContactResponse>(
        `/engagement/v2/contacts/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      let expectedEmailAddresses = testContact.email_addresses;

      if (providerName === 'outreach') {
        // outreach does not support email_address_type
        expectedEmailAddresses =
          expectedEmailAddresses?.map((emailAddress) => {
            return {
              email_address: emailAddress.email_address,
              email_address_type: null,
            };
          }) ?? [];
      }

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.first_name).toEqual(testContact.first_name);
      expect(getResponse.data.last_name).toEqual(testContact.last_name);
      expect(getResponse.data.job_title).toEqual(testContact.job_title);
      expect(getResponse.data.email_addresses).toEqual(expectedEmailAddresses);

      // test that the db was updated
      const dbContact = await db.query('SELECT * FROM engagement_contacts WHERE id = $1', [response.data.record?.id]);
      expect(dbContact.rows[0].first_name).toEqual(testContact.first_name);
      expect(dbContact.rows[0].last_name).toEqual(testContact.last_name);
      expect(dbContact.rows[0].job_title).toEqual(testContact.job_title);
      expect(dbContact.rows[0].email_addresses).toEqual(expectedEmailAddresses);
    }, 120000);

    test('PATCH /', async () => {
      const response = await apiClient.post<CreateContactResponse>(
        '/engagement/v2/contacts',
        { record: testContact },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();

      const updateResponse = await apiClient.patch<UpdateContactResponse>(
        `/engagement/v2/contacts/${response.data.record?.id}`,
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

      // TODO get not supported for apollo
      if (providerName === 'apollo') {
        return;
      }
      const getResponse = await apiClient.get<GetContactResponse>(
        `/engagement/v2/contacts/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      let expectedEmailAddresses = testContact.email_addresses;

      if (providerName === 'outreach') {
        // outreach does not support email_address_type
        expectedEmailAddresses =
          expectedEmailAddresses?.map((emailAddress) => {
            return {
              email_address: emailAddress.email_address,
              email_address_type: null,
            };
          }) ?? [];
      }

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.first_name).toEqual('updated');
      expect(getResponse.data.last_name).toEqual('contact');
      expect(getResponse.data.job_title).toEqual(testContact.job_title);
      expect(getResponse.data.email_addresses).toEqual(expectedEmailAddresses);

      // test that the db was updated
      const dbContact = await db.query('SELECT * FROM engagement_contacts WHERE id = $1', [response.data.record?.id]);
      expect(dbContact.rows[0].first_name).toEqual('updated');
      expect(dbContact.rows[0].last_name).toEqual('contact');
      expect(dbContact.rows[0].job_title).toEqual(testContact.job_title);
      expect(dbContact.rows[0].email_addresses).toEqual(expectedEmailAddresses);
    }, 120000);
  });
});
