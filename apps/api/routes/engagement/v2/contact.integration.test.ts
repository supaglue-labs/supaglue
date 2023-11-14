/**
 * Tests contacts endpoints
 *
 * @group integration/engagement/v2/contacts
 * @jest-environment ./integration-test-environment
 */

import { capitalizeString } from '@supaglue/core/remotes/utils/string';
import type {
  CreateContactRequest,
  CreateContactResponse,
  GetContactResponse,
  SearchContactsResponse,
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

  // TODO: re-enable apollo tests
  describe.each(['outreach', 'salesloft'])('%s', (providerName) => {
    test(`Test that POST followed by GET has correct data and properly cache invalidates`, async () => {
      const response = await apiClient.post<CreateContactResponse>(
        '/engagement/v2/contacts',
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
      if (providerName === 'apollo') {
        expect(getResponse.data.first_name).toEqual(capitalizeString(testContact.first_name as string));
        expect(getResponse.data.last_name).toEqual(capitalizeString(testContact.last_name as string));
      } else {
        expect(getResponse.data.first_name).toEqual(testContact.first_name);
        expect(getResponse.data.last_name).toEqual(testContact.last_name);
      }
      expect(getResponse.data.job_title).toEqual(testContact.job_title);
      expect(getResponse.data.email_addresses).toEqual(expectedEmailAddresses);

      // test that the db was updated
      const dbContact = await db.query('SELECT * FROM engagement_contacts WHERE id = $1', [response.data.record?.id]);
      if (providerName === 'apollo') {
        expect(dbContact.rows[0].first_name).toEqual(capitalizeString(testContact.first_name as string));
        expect(dbContact.rows[0].last_name).toEqual(capitalizeString(testContact.last_name as string));
      } else {
        expect(dbContact.rows[0].first_name).toEqual(testContact.first_name);
        expect(dbContact.rows[0].last_name).toEqual(testContact.last_name);
      }
      expect(dbContact.rows[0].job_title).toEqual(testContact.job_title);
      expect(dbContact.rows[0].email_addresses).toEqual(expectedEmailAddresses);
    }, 120_000);

    test('Test that POST followed by PATCH followed by GET has correct data and cache invalidates', async () => {
      const response = await apiClient.post<CreateContactResponse>(
        '/engagement/v2/contacts',
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
    }, 120_000);

    test(`Test that POST followed by SEARCH has correct data`, async () => {
      const response = await apiClient.post<CreateContactResponse>(
        '/engagement/v2/contacts',
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

      if (providerName === 'apollo') {
        await new Promise((resolve) => setTimeout(resolve, 10_000));
      }

      const searchResponse = await apiClient.post<SearchContactsResponse>(
        `/engagement/v2/contacts/_search`,
        {
          filter: {
            emails: [testContact.email_addresses?.[0].email_address],
          },
        },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(searchResponse.status).toEqual(200);
      expect(searchResponse.data.records.length).toEqual(1);
      expect(searchResponse.data.records[0].id).toEqual(response.data.record?.id);
    }, 120_000);
  });
});
