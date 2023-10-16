/**
 * Tests accounts endpoints
 *
 * @group integration/engagement/v2/accounts
 */

import type {
  CreateAccountRequest,
  CreateAccountResponse,
  GetAccountResponse,
  UpdateAccountResponse,
} from '@supaglue/schemas/v2/engagement';

describe('account', () => {
  const testAccount: CreateAccountRequest['record'] = {
    name: 'test account',
  };

  describe.each(['outreach', 'apollo'])('%s', (providerName) => {
    test(`POST /`, async () => {
      const response = await apiClient.post<CreateAccountResponse>(
        '/engagement/v2/accounts',
        { record: testAccount },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(200);
      expect(response.data.record?.id).toBeTruthy();

      const getResponse = await apiClient.get<GetAccountResponse>(
        `/engagement/v2/accounts/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual(testAccount.name);
    }, 20000);

    test('PATCH /', async () => {
      const response = await apiClient.post<CreateAccountResponse>(
        '/engagement/v2/accounts',
        { record: testAccount },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(200);
      expect(response.data.record?.id).toBeTruthy();

      const updateResponse = await apiClient.patch<UpdateAccountResponse>(
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

      const getResponse = await apiClient.get<GetAccountResponse>(
        `/engagement/v2/accounts/${response.data.record?.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(getResponse.data.id).toEqual(response.data.record?.id);
      expect(getResponse.data.name).toEqual('updated account');
    }, 10000);
  });
});
