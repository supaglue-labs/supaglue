/**
 * Tests accounts endpoints
 *
 * @group integration/crm/v2/metadata/custom_objects
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateCustomObjectSchemaRequest,
  CreateCustomObjectSchemaResponse,
  GetCustomObjectSchemaResponse,
} from '@supaglue/schemas/v2/crm';

describe('custom_objects', () => {
  let testCustomObject: CreateCustomObjectSchemaRequest['object'];

  beforeEach(() => {
    testCustomObject = {
      name: `CustomTest${Math.random()}`,
      description: 'my desc here',
      labels: {
        singular: `CustomTest${Math.random()}`,
        plural: `CustomTest${Math.random()}s`,
      },
      primary_field_id: 'name',
      fields: [
        {
          label: 'My Name Field',
          id: 'name',
          is_required: true,
          type: 'text',
        },
        {
          label: 'My Description Field',
          id: 'description__c',
          is_required: true,
          type: 'textarea',
        },
        {
          label: 'My Int Field',
          id: 'int__c',
          is_required: false,
          type: 'number',
          precision: 18,
          scale: 0,
        },
        {
          label: 'My Double Field',
          id: 'double__c',
          is_required: true,
          type: 'number',
          precision: 18,
          scale: 3,
        },
        {
          label: 'My boolean Field',
          id: 'bool__c',
          is_required: false,
          type: 'boolean',
        },
      ],
    };
  });

  describe.each(['hubspot', 'salesforce'])('%s', (providerName) => {
    test(`Post /`, async () => {
      const response = await apiClient.post<CreateCustomObjectSchemaResponse>(
        '/crm/v2/metadata/custom_objects',
        { object: testCustomObject },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.object?.name).toEqual(testCustomObject.name);
      addedObjects.push({
        id: response.data.object?.name as string,
        providerName,
        objectName: 'custom_object',
      });

      const getResponse = await apiClient.get<GetCustomObjectSchemaResponse>(
        `/crm/v2/metadata/custom_objects/${response.data.object!.name}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.name).toEqual(
        providerName === 'salesforce ' ? `${testCustomObject.name}__c` : testCustomObject.name
      );
    });
  });
});
