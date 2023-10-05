/**
 * Tests accounts endpoints
 *
 * @group integration/crm/v2/accounts
 */

describe('account CRUD', () => {
  // TODO dummy test - implement real ones
  test('GET /:id', async () => {
    await expect(async () => {
      await apiClient.get('/crm/v2/accounts/1', { headers: { 'x-provider-name': 'salesforce' } });
    }).rejects.toThrow();
  });
});
