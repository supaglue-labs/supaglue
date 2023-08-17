import { describe, expect, test } from '@jest/globals';
import { fromHubSpotCompanyToAccount } from './mappers';

describe('account', () => {
  test('fromHubSpotCompanyToAccount', () => {
    const hubspotCompany = {
      id: '16984059819',
      properties: {
        createdate: '2023-08-16T20:30:15.590Z',
        domain: 'test.com',
        hs_lastmodifieddate: '2023-08-17T18:15:37.674Z',
        hs_object_id: '16984059819',
        name: 'Test Company',
      },
      createdAt: new Date('2023-08-16T20:30:15.590Z'),
      updatedAt: new Date('2023-08-17T18:15:37.674Z'),
      archived: false,
    };

    expect(fromHubSpotCompanyToAccount(hubspotCompany)).toEqual({
      id: '16984059819',
      name: 'Test Company',
    });
  });
});
