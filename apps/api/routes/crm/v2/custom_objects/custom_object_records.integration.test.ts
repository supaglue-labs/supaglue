/**
 * Tests custom object records endpoints
 *
 * @group integration/crm/v2/custom_objects
 * @jest-environment ./integration-test-environment
 */

import type {
  CreateCustomObjectRecordResponse,
  GetCustomObjectRecordResponse,
  UpdateCustomObjectRecordResponse,
} from '@supaglue/schemas/v2/crm';

export const PERMANENT_CUSTOM_OBJECT_NAME = 'PermanentCustomObject';

type PermanentCustomObject = {
  name: string;
  description__c: string;
  int__c?: number;
  double__c?: number;
  bool__c?: boolean;
};

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

describe('custom_objects_records', () => {
  let testCustomObjectRecord: PermanentCustomObject;

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

  // describe.each(['hubspot'])('%s', (providerName) => {
  describe.each(['hubspot', 'salesforce'])('%s', (providerName) => {
    test(`Post /`, async () => {
      const fullObjectName = providerName === 'hubspot' ? 'PermanentCustomObject' : 'PermanentCustomObject__c';
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
        objectName: PERMANENT_CUSTOM_OBJECT_NAME,
      });
      const getResponse = await apiClient.get<GetCustomObjectRecordResponse>(
        `/crm/v2/custom_objects/${fullObjectName}/records/${response.data.record!.id}`,
        {
          headers: { 'x-provider-name': providerName },
        }
      );

      expect(getResponse.status).toEqual(200);
      expect(getResponse.data.id).toEqual(response.data.record!.id);
      expect(getResponse.data.custom_object_name).toEqual(
        providerName === 'hubspot' ? 'PermanentCustomObject' : 'PermanentCustomObject__c'
      );
      expect(providerName === 'hubspot' ? getResponse.data.data.name : getResponse.data.data.Name).toEqual(
        testCustomObjectRecord.name
      );
      expect(getResponse.data.data.int__c?.toString()).toEqual(testCustomObjectRecord.int__c?.toString());
      expect(getResponse.data.data.description__c).toEqual(testCustomObjectRecord.description__c);
      expect(getResponse.data.data.double__c?.toString()).toEqual(testCustomObjectRecord.double__c?.toString());
      expect(getResponse.data.data.bool__c?.toString()).toEqual(testCustomObjectRecord.bool__c?.toString());

      // test that the db was updated
      const dbRow = await db.query(
        `SELECT * FROM custom_objects WHERE _supaglue_id = $1 AND _supaglue_provider_name = $2`,
        [response.data.record?.id, providerName]
      );
      expect(dbRow.rows.length).toEqual(1);
      expect(dbRow.rows[0]._supaglue_id).toEqual(response.data.record?.id);
      const rawData = dbRow.rows[0]._supaglue_raw_data;
      expect(rawData.int__c?.toString()).toEqual(testCustomObjectRecord.int__c?.toString());
      expect(rawData.description__c).toEqual(testCustomObjectRecord.description__c);
      expect(rawData.double__c?.toString()).toEqual(testCustomObjectRecord.double__c?.toString());
      expect(rawData.bool__c?.toString()).toEqual(testCustomObjectRecord.bool__c?.toString());
    }, 120_000);

    test(`Patch /`, async () => {
      const fullObjectName = providerName === 'hubspot' ? 'PermanentCustomObject' : 'PermanentCustomObject__c';
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
        objectName: PERMANENT_CUSTOM_OBJECT_NAME,
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
      expect(getResponse.data.custom_object_name).toEqual(
        providerName === 'hubspot' ? 'PermanentCustomObject' : 'PermanentCustomObject__c'
      );
      expect(providerName === 'hubspot' ? getResponse.data.data.name : getResponse.data.data.Name).toEqual('updated');
      expect(getResponse.data.data.int__c?.toString()).toEqual('2');
      expect(getResponse.data.data.description__c).toEqual('updated_description');
      expect(getResponse.data.data.double__c?.toString()).toEqual('0.2');
      expect(getResponse.data.data.bool__c?.toString()).toEqual('false');

      // test that the db was updated
      const dbRow = await db.query(
        `SELECT * FROM custom_objects WHERE _supaglue_id = $1 AND _supaglue_provider_name = $2`,
        [response.data.record?.id, providerName]
      );
      expect(dbRow.rows.length).toEqual(1);
      expect(dbRow.rows[0]._supaglue_id).toEqual(response.data.record?.id);
      const rawData = dbRow.rows[0]._supaglue_raw_data;

      expect(rawData.int__c?.toString()).toEqual(updatedCustomObjectRecord.int__c?.toString());
      expect(rawData.description__c).toEqual(updatedCustomObjectRecord.description__c);
      expect(rawData.double__c?.toString()).toEqual(updatedCustomObjectRecord.double__c?.toString());
      expect(rawData.bool__c?.toString()).toEqual(updatedCustomObjectRecord.bool__c?.toString());
    }, 120_000);

    test(`Post BadRequest /`, async () => {
      const response = await apiClient.post<CreateCustomObjectRecordResponse>(
        `/crm/v2/custom_objects/${PERMANENT_CUSTOM_OBJECT_NAME}/records`,
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
    }, 120_000);
  });
});
