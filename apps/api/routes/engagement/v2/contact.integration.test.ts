/**
 * Tests contacts endpoints
 *
 * @group integration/engagement/v2/contacts
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

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.first_name).toEqual(testContact.first_name);
      expect(getResponse.data.last_name).toEqual(testContact.last_name);
    }, 20000);

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
      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.first_name).toEqual('updated');
      expect(getResponse.data.last_name).toEqual('contact');
    }, 10000);
  });
});
