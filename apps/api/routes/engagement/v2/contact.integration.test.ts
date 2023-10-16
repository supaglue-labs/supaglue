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
  const testContact: CreateContactRequest['record'] = {
    first_name: 'first',
    last_name: 'last',
  };

  describe.each(['outreach', 'apollo'])('%s', (providerName) => {
    test(`POST /`, async () => {
      const response = await apiClient.post<CreateContactResponse>(
        '/engagement/v2/contacts',
        { record: testContact },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(200);
      expect(response.data.record?.id).toBeTruthy();

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
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(getResponse.data.addresses).toEqual(testContact.record.addresses);
    }, 20000);

    test('PATCH /', async () => {
      const response = await apiClient.post<CreateContactResponse>(
        '/engagement/v2/contacts',
        { record: testContact },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(200);
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

      const getResponse = await apiClient.get<GetContactResponse>(
        `/engagement/v2/contacts/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.first_name).toEqual('updated');
      expect(getResponse.data.last_name).toEqual('contact');
      // TODO this fails. For salesforce and pipedrive, no addresses are returned, for hubspot, the returned address is missing street_2
      // expect(getResponse.data.addresses).toEqual(testContact.record.addresses);
    }, 10000);
  });
});
