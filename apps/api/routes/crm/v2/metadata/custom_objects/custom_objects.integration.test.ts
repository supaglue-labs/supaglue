/**
 * Tests custom object schema endpoints
 *
 * @group integration/crm/v2/metadata/custom_objects
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateCustomObjectSchemaRequest,
  CreateCustomObjectSchemaResponse,
  GetCustomObjectSchemaResponse,
  ListCustomObjectSchemasResponse,
  UpdateCustomObjectSchemaPathParams,
} from '@supaglue/schemas/v2/crm';

describe('custom_objects', () => {
  let testCustomObject: CreateCustomObjectSchemaRequest['object'];

  beforeEach(() => {
    const randomNumber = Math.floor(Math.random() * 100_000);
    testCustomObject = {
      name: `CustomTest${randomNumber}`,
      description: 'my desc here',
      labels: {
        singular: `CustomTest${randomNumber}`,
        plural: `CustomTest${randomNumber}s`,
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
      const fullObjectName = providerName === 'salesforce' ? `${testCustomObject.name}__c` : testCustomObject.name;
      const response = await apiClient.post<CreateCustomObjectSchemaResponse>(
        '/crm/v2/metadata/custom_objects',
        { object: testCustomObject },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.object?.name).toEqual(fullObjectName);
      addedObjects.push({
        id: response.data.object?.name as string,
        providerName,
        objectName: 'custom_object',
      });

      // sleep for 30 seconds to allow hubspot to update indexes
      if (providerName === 'hubspot') {
        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }

      const getResponse = await apiClient.get<GetCustomObjectSchemaResponse>(
        `/crm/v2/metadata/custom_objects/${testCustomObject.name}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.name).toEqual(fullObjectName);
      expect(getResponse.data.description).toEqual(providerName === 'hubspot' ? null : 'my desc here');
      expect(getResponse.data.labels).toEqual(testCustomObject.labels);
      testCustomObject.fields.forEach((field) => {
        if (providerName === 'salesforce' && field.id === 'name') {
          field.id = 'Name';
        }
        if (providerName === 'hubspot') {
          delete field.precision;
          delete field.scale;
        }
        expect(getResponse.data.fields).toContainEqual(expect.objectContaining(field));
      });

      const listResponse = await apiClient.get<ListCustomObjectSchemasResponse>('/crm/v2/metadata/custom_objects', {
        headers: { 'x-provider-name': providerName },
      });
      expect(listResponse.status).toEqual(200);
      expect(listResponse.data).toContain(fullObjectName);
    }, 120_000);

    test(`Put /`, async () => {
      const fullObjectName = providerName === 'salesforce' ? `${testCustomObject.name}__c` : testCustomObject.name;
      const response = await apiClient.post<CreateCustomObjectSchemaResponse>(
        '/crm/v2/metadata/custom_objects',
        { object: testCustomObject },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.object?.name).toEqual(fullObjectName);
      addedObjects.push({
        id: response.data.object?.name as string,
        providerName,
        objectName: 'custom_object',
      });

      // sleep for 12 seconds to allow hubspot to update indexes
      if (providerName === 'hubspot') {
        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }

      const updatedCustomObject = {
        ...testCustomObject,
        labels: {
          singular: `${testCustomObject.name}Updated`,
          plural: `${testCustomObject.name}Updateds`,
        },
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
            is_required: false,
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
            is_required: false,
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
          {
            label: 'Another Text Field',
            id: 'text__c',
            is_required: true,
            type: 'text',
          },
        ],
      };

      const updateResponse = await apiClient.put<UpdateCustomObjectSchemaPathParams>(
        `/crm/v2/metadata/custom_objects/${testCustomObject.name}`,
        {
          object: updatedCustomObject,
        },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(updateResponse.status).toEqual(204);

      // sleep for 30 seconds to allow hubspot to update indexes
      if (providerName === 'hubspot') {
        await new Promise((resolve) => setTimeout(resolve, 30_000));
      }

      const getResponse = await apiClient.get<GetCustomObjectSchemaResponse>(
        `/crm/v2/metadata/custom_objects/${testCustomObject.name}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.name).toEqual(fullObjectName);
      expect(getResponse.data.labels).toEqual({
        singular: `${testCustomObject.name}Updated`,
        plural: `${testCustomObject.name}Updateds`,
      });
      updatedCustomObject.fields.forEach((field) => {
        if (providerName === 'salesforce' && field.id === 'name') {
          field.id = 'Name';
        }
        if (providerName === 'hubspot') {
          delete field.precision;
          delete field.scale;
        }
        expect(getResponse.data.fields).toContainEqual(expect.objectContaining(field));
      });
    }, 120_000);
  });

  test(`Hubspot BadRequest /`, async () => {
    const providerName = 'hubspot';
    const fullObjectName = testCustomObject.name;
    const response = await apiClient.post<CreateCustomObjectSchemaResponse>(
      '/crm/v2/metadata/custom_objects',
      { object: testCustomObject },
      {
        headers: { 'x-provider-name': 'hubspot' },
      }
    );
    expect(response.status).toEqual(201);
    expect(response.data.object?.name).toEqual(fullObjectName);
    addedObjects.push({
      id: response.data.object?.name as string,
      providerName,
      objectName: 'custom_object',
    });

    // sleep for 30 seconds to allow hubspot to update indexes
    await new Promise((resolve) => setTimeout(resolve, 30_000));

    const updatedCustomObject = {
      ...testCustomObject,
      labels: {
        singular: `${testCustomObject.name}Updated`,
        plural: `${testCustomObject.name}Updateds`,
      },
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
          is_required: false,
          type: 'textarea',
        },
      ],
    };

    // Deleting fields is not allowed in hubspot
    const updateResponse = await apiClient.put<UpdateCustomObjectSchemaPathParams>(
      `/crm/v2/metadata/custom_objects/${testCustomObject.name}`,
      {
        object: updatedCustomObject,
      },
      {
        headers: { 'x-provider-name': providerName },
      }
    );
    expect(updateResponse.status).toEqual(400);
    expect(updateResponse.data).toEqual({
      errors: [
        {
          title:
            'Cannot delete fields from custom object schema in hubspot. Fields to delete: bool__c, double__c, int__c',
          problem_type: 'BAD_REQUEST_ERROR',
        },
      ],
    });
  }, 120_000);

  test(`Salesforce BadRequest /`, async () => {
    const providerName = 'salesforce';
    const response = await apiClient.post<CreateCustomObjectSchemaResponse>(
      '/crm/v2/metadata/custom_objects',
      {
        object: {
          ...testCustomObject,
          fields: [
            {
              label: 'My Name Field',
              id: 'name',
              is_required: true,
              type: 'text',
            },
            {
              label: 'My Description Field',
              id: 'description', // This will fail due to lack of `__c`
              is_required: true,
              type: 'textarea',
            },
          ],
        },
      },
      {
        headers: { 'x-provider-name': providerName },
      }
    );
    expect(response.status).toEqual(400);
    expect(response.data).toEqual({
      errors: [
        {
          title: 'Custom object field key names must end with __c',
          problem_type: 'BAD_REQUEST_ERROR',
        },
      ],
    });
  }, 120_000);
});
