/**
 * Tests custom object records endpoints
 *
 * @group integration/crm/v2/custom_objects
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateCustomObjectRecordResponse,
  GetCustomObjectRecordResponse,
  ListCustomObjectRecordsResponse,
  UpdateCustomObjectRecordResponse,
} from '@supaglue/schemas/v2/crm';

jest.retryTimes(3);

// Permanent custom object schema:
// {
//       "name": "PermanentCustomObject",
//       "description": "Permanent Custom Object to be used for integration tests",
//       "labels": {
//           "singular": "PermanentCustomObject",
//           "plural": "PermanentCustomObjects"
//       },
//       "primary_field_id": "name",
//       "fields": [
//           {
//               "label": "My Name Field",
//               "id": "name",
//               "is_required": true,
//               "type": "text"
//           },
//           {
//               "label": "My Description Field",
//               "id": "description__c",
//               "is_required": true,
//               "type": "textarea"
//           },
//           {
//               "label": "My Int Field",
//               "id": "int__c",
//               "is_required": false,
//               "type": "number",
//               "precision": 18,
//               "scale": 0
//           },
//           {
//               "label": "My Double Field",
//               "id": "double__c",
//               "is_required": false,
//               "type": "number",
//               "precision": 18,
//               "scale": 3
//           },
//           {
//               "label": "My boolean Field",
//               "id": "bool__c",
//               "is_required": false,
//               "type": "boolean"
//           }
//       ]
// }

const CUSTOM_OBJECT_NAME_MAP: Record<string, string> = {
  hubspot: 'PermanentCustomObject',
  salesforce: 'PermanentCustomObject__c',
  ms_dynamics_365_sales: 'permanentcustomobject',
};

describe('custom_objects_records', () => {
  let testCustomObjectRecord: Record<string, unknown>;

  beforeEach(() => {
    const randomNumber = Math.floor(Math.random() * 100_000);
    testCustomObjectRecord = {
      name: `Object ${randomNumber}`,
      description__c: 'my desc here',
      int__c: 1,
      double__c: 0.1,
      bool__c: true,
    };
  });

  describe.each(['hubspot', 'salesforce', 'ms_dynamics_365_sales'])('%s', (providerName) => {
    let fullObjectName: string;
    beforeEach(() => {
      fullObjectName = CUSTOM_OBJECT_NAME_MAP[providerName];
    });

    test(`Test that POST followed by GET has correct data and properly cache invalidates`, async () => {
      const response = await apiClient.post<CreateCustomObjectRecordResponse>(
        `/crm/v2/custom_objects/${fullObjectName}/records`,
        { record: testCustomObjectRecord },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();

      addedObjects.push({
        id: response.data.record!.id,
        providerName,
        objectName: providerName === 'ms_dynamics_365_sales' ? `cr50e_${fullObjectName}` : fullObjectName,
      });
      const getResponse = await apiClient.get<GetCustomObjectRecordResponse>(
        `/crm/v2/custom_objects/${fullObjectName}/records/${response.data.record!.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record!.id);
      expect(getResponse.data.custom_object_name).toEqual(fullObjectName);
      const properties = (
        providerName === 'hubspot' ? getResponse.data.data.properties : getResponse.data.data
      ) as Record<string, unknown>;
      expect(
        providerName === 'hubspot' || providerName === 'ms_dynamics_365_sales' ? properties.name : properties.Name
      ).toEqual(testCustomObjectRecord.name);
      expect(properties.int__c?.toString()).toEqual(testCustomObjectRecord.int__c?.toString());
      expect(properties.description__c).toEqual(testCustomObjectRecord.description__c);
      expect(properties.double__c?.toString()).toEqual(testCustomObjectRecord.double__c?.toString());
      expect(properties.bool__c?.toString()).toEqual(testCustomObjectRecord.bool__c?.toString());

      // test that the db was updated
      const cachedReadResponse = await apiClient.get<ListCustomObjectRecordsResponse>(
        `/crm/v2/custom_objects/${fullObjectName}/records?read_from_cache=true&modified_after=${encodeURIComponent(
          testStartTime.toISOString()
        )}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(cachedReadResponse.status).toEqual(200);
      const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
      expect(found).toBeTruthy();
      expect(found?.id).toEqual(response.data.record?.id);
      const cachedProperties =
        providerName === 'hubspot' ? (found?.data?.properties as Record<string, unknown>) : found?.data;
      expect(cachedProperties?.int__c?.toString()).toEqual(testCustomObjectRecord.int__c?.toString());
      expect(cachedProperties?.description__c).toEqual(testCustomObjectRecord.description__c);
      expect(cachedProperties?.double__c?.toString()).toEqual(testCustomObjectRecord.double__c?.toString());
      expect(cachedProperties?.bool__c?.toString()).toEqual(testCustomObjectRecord.bool__c?.toString());
    }, 120_000);

    test(`Test that POST followed by PATCH followed by GET has correct data and cache invalidates`, async () => {
      const response = await apiClient.post<CreateCustomObjectRecordResponse>(
        `/crm/v2/custom_objects/${fullObjectName}/records`,
        { record: testCustomObjectRecord },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(response.status).toEqual(201);
      expect(response.data.record?.id).toBeTruthy();

      addedObjects.push({
        id: response.data.record!.id,
        providerName,
        objectName: providerName === 'ms_dynamics_365_sales' ? `cr50e_${fullObjectName}` : fullObjectName,
      });

      const updatedCustomObjectRecord = {
        name: 'updated',
        description__c: 'updated_description',
        int__c: 2,
        double__c: 0.2,
        bool__c: false,
      };

      const updateResponse = await apiClient.patch<UpdateCustomObjectRecordResponse>(
        `/crm/v2/custom_objects/${fullObjectName}/records/${response.data.record!.id}`,
        {
          record: updatedCustomObjectRecord,
        },
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(updateResponse.status).toEqual(200);
      expect(updateResponse.data.record?.id).toEqual(response.data.record?.id);

      // sleep 12 seconds
      if (providerName === 'hubspot') {
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }
      const getResponse = await apiClient.get<GetCustomObjectRecordResponse>(
        `/crm/v2/custom_objects/${fullObjectName}/records/${response.data.record!.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record!.id);
      expect(getResponse.data.custom_object_name).toEqual(fullObjectName);
      const properties = (
        providerName === 'hubspot' ? getResponse.data.data.properties : getResponse.data.data
      ) as Record<string, unknown>;
      expect(
        providerName === 'hubspot' || providerName === 'ms_dynamics_365_sales' ? properties.name : properties.Name
      ).toEqual('updated');
      expect(properties.int__c?.toString()).toEqual('2');
      expect(properties.description__c).toEqual('updated_description');
      expect(properties.double__c?.toString()).toEqual('0.2');
      expect(properties.bool__c?.toString()).toEqual('false');

      // test that the db was updated
      const cachedReadResponse = await apiClient.get<ListCustomObjectRecordsResponse>(
        `/crm/v2/custom_objects/${fullObjectName}/records?read_from_cache=true&modified_after=${encodeURIComponent(
          testStartTime.toISOString()
        )}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );
      expect(cachedReadResponse.status).toEqual(200);
      const found = cachedReadResponse.data.records.find((r) => r.id === response.data.record?.id);
      expect(found).toBeTruthy();
      expect(found?.id).toEqual(response.data.record?.id);
      const cachedProperties =
        providerName === 'hubspot' ? (found?.data?.properties as Record<string, unknown>) : found?.data;
      expect(cachedProperties?.int__c?.toString()).toEqual('2');
      expect(cachedProperties?.description__c).toEqual('updated_description');
      expect(cachedProperties?.double__c?.toString()).toEqual('0.2');
      expect(cachedProperties?.bool__c?.toString()).toEqual('false');
    }, 120_000);

    testIf(
      // ms_dynamics_365_sales doesn't seem to do validation of required fields in their API
      providerName !== 'ms_dynamics_365_sales',
      `Test that Bad Requests have useful errors`,
      async () => {
        const response = await apiClient.post<CreateCustomObjectRecordResponse>(
          `/crm/v2/custom_objects/${fullObjectName}/records`,
          // This will fail because description__c is required
          { record: { ...testCustomObjectRecord, description__c: undefined } },
          {
            headers: { 'x-provider-name': providerName },
          }
        );
        expect(response.status).toEqual(400);
        expect(response.data.errors?.[0].title).toEqual(
          providerName === 'hubspot'
            ? 'Error creating PermanentCustomObject.  Some required properties were not set.'
            : 'Required fields are missing'
        );
      },
      120_000
    );
  });
});
