/**
 * Tests Hubspot mappers
 *
 * @group unit/mappers/hubspot
 */

import type { Property as HubspotProperty } from '@hubspot/api-client/lib/codegen/crm/properties/index';
import type { ObjectSchema } from '@hubspot/api-client/lib/codegen/crm/schemas/index';
import { describe, expect, test } from '@jest/globals';
import type { PropertyType } from '@supaglue/types';
import type { AccountCreateParams, ContactCreateParams, OpportunityCreateParams } from '@supaglue/types/crm';
import {
  CRM_FAX,
  CRM_MOBILE_PHONE,
  CRM_PRIMARY_ADDRESS,
  CRM_PRIMARY_EMAIL,
  CRM_PRIMARY_PHONE,
  CRM_WORK_EMAIL,
  DATE,
  DATE_STRING,
  HUBSPOT_PIPELINE_STAGE_MAPPING,
} from '../../utils/test_data';
import {
  fromHubSpotCompanyToAccount,
  fromHubSpotContactToContact,
  fromHubSpotDealToOpportunity,
  fromHubspotOwnerToUser,
  getPropertyType,
  toCustomObject,
  toHubspotAccountCreateParams,
  toHubspotContactCreateParams,
  toHubspotOpportunityCreateParams,
  toHubspotTypeAndFieldType,
  toPropertyUnified,
  toRawDetails,
} from './mappers';

describe('Hubspot Mappers', () => {
  describe('fromHubSpotCompanyToAccount', () => {
    test('fromHubSpotCompanyToAccount basic', () => {
      const hubspotCompany = {
        id: '16984059819',
        properties: {
          createdate: DATE_STRING,
          domain: 'test.com',
          hs_lastmodifieddate: DATE_STRING,
          hs_object_id: '16984059819',
          name: 'Test Company',
          numberofemployees: '100',
          address: CRM_PRIMARY_ADDRESS.street1 as string,
          city: CRM_PRIMARY_ADDRESS.city as string,
          state: CRM_PRIMARY_ADDRESS.state as string,
          zip: CRM_PRIMARY_ADDRESS.postalCode as string,
          country: CRM_PRIMARY_ADDRESS.country as string,
          phone: CRM_PRIMARY_PHONE.phoneNumber as string,
        },
        createdAt: DATE_STRING,
        updatedAt: DATE_STRING,
        archived: false,
      };

      expect(fromHubSpotCompanyToAccount(hubspotCompany)).toEqual({
        addresses: [CRM_PRIMARY_ADDRESS],
        createdAt: DATE,
        description: null,
        id: '16984059819',
        industry: null,
        isDeleted: false,
        lastActivityAt: null,
        lastModifiedAt: DATE,
        lifecycleStage: null,
        name: 'Test Company',
        numberOfEmployees: 100,
        ownerId: null,
        phoneNumbers: [CRM_PRIMARY_PHONE],
        rawData: {
          createdate: DATE_STRING,
          domain: 'test.com',
          hs_lastmodifieddate: DATE_STRING,
          hs_object_id: '16984059819',
          name: 'Test Company',
          numberofemployees: '100',
          address: CRM_PRIMARY_ADDRESS.street1 as string,
          city: CRM_PRIMARY_ADDRESS.city as string,
          state: CRM_PRIMARY_ADDRESS.state as string,
          zip: CRM_PRIMARY_ADDRESS.postalCode as string,
          country: CRM_PRIMARY_ADDRESS.country as string,
          phone: CRM_PRIMARY_PHONE.phoneNumber as string,
        },
        updatedAt: DATE,
        website: null,
      });
    });

    test('invalid number_of_employees', () => {
      const hubspotCompany = {
        id: '16984059819',
        properties: {
          createdate: DATE_STRING,
          domain: 'test.com',
          hs_lastmodifieddate: DATE_STRING,
          hs_object_id: '16984059819',
          name: 'Test Company',
          numberofemployees: '7000000001',
        },
        createdAt: DATE_STRING,
        updatedAt: DATE_STRING,
        archived: false,
      };

      expect(fromHubSpotCompanyToAccount(hubspotCompany)).toEqual({
        addresses: [],
        createdAt: expect.any(Date),
        description: null,
        id: '16984059819',
        industry: null,
        isDeleted: false,
        lastActivityAt: null,
        lastModifiedAt: DATE,
        lifecycleStage: null,
        name: 'Test Company',
        numberOfEmployees: null,
        ownerId: null,
        phoneNumbers: [],
        rawData: {
          createdate: DATE_STRING,
          domain: 'test.com',
          hs_lastmodifieddate: DATE_STRING,
          hs_object_id: '16984059819',
          name: 'Test Company',
          numberofemployees: '7000000001',
        },
        updatedAt: DATE,
        website: null,
      });
    });
  });
  describe('toHubspotAccountCreateParams', () => {
    test('toHubspotAccountCreateParams basic', () => {
      const params: AccountCreateParams = {
        name: 'Test Company',
        description: 'Test description',
        industry: 'Test industry',
        website: 'test.com',
        numberOfEmployees: 100,
        addresses: [CRM_PRIMARY_ADDRESS],
        phoneNumbers: [CRM_PRIMARY_PHONE],
        lastActivityAt: DATE,
        lifecycleStage: 'lead',
        ownerId: '123',
        customFields: {
          custom1: 'value1',
          custom2: 'value2',
        },
      };
      expect(toHubspotAccountCreateParams(params)).toEqual({
        address: 'Test street 1',
        city: 'San Francisco',
        country: 'USA',
        custom1: 'value1',
        custom2: 'value2',
        description: 'Test description',
        hubspot_owner_id: '123',
        industry: 'Test industry',
        lifecyclestage: 'lead',
        name: 'Test Company',
        numberofemployees: '100',
        phone: '5102932345',
        state: 'CA',
        website: 'test.com',
        zip: '94043',
      });
    });
    test('toHubspotAccountCreateParams partial', () => {
      const params: AccountCreateParams = {
        name: 'Test Company',
        customFields: {
          custom1: 'value1',
          custom2: 'value2',
        },
      };
      expect(toHubspotAccountCreateParams(params)).toEqual({
        custom1: 'value1',
        custom2: 'value2',
        name: 'Test Company',
      });
    });
  });
  describe('fromHubSpotContactToContact', () => {
    test('fromHubSpotContactToContact basic', () => {
      const hubspotContact = {
        id: '101',
        properties: {
          createdate: DATE_STRING,
          email: CRM_PRIMARY_EMAIL.emailAddress as string,
          work_email: CRM_WORK_EMAIL.emailAddress as string,
          firstname: 'Test',
          hs_object_id: '101',
          lastmodifieddate: DATE_STRING,
          lastname: 'Contact',
          address: CRM_PRIMARY_ADDRESS.street1 as string,
          city: CRM_PRIMARY_ADDRESS.city as string,
          state: CRM_PRIMARY_ADDRESS.state as string,
          zip: CRM_PRIMARY_ADDRESS.postalCode as string,
          country: CRM_PRIMARY_ADDRESS.country as string,
          phone: CRM_PRIMARY_PHONE.phoneNumber as string,
          mobilePhone: CRM_MOBILE_PHONE.phoneNumber as string,
          fax: CRM_FAX.phoneNumber as string,
        },
        associations: {
          company: ['16984059819'],
        },
        createdAt: DATE_STRING,
        updatedAt: DATE_STRING,
        archived: false,
      };

      expect(fromHubSpotContactToContact(hubspotContact)).toEqual({
        accountId: '16984059819',
        addresses: [CRM_PRIMARY_ADDRESS],
        createdAt: DATE,
        emailAddresses: [CRM_PRIMARY_EMAIL, CRM_WORK_EMAIL],
        firstName: 'Test',
        id: '101',
        isDeleted: false,
        lastActivityAt: null,
        lastModifiedAt: DATE,
        lastName: 'Contact',
        lifecycleStage: null,
        ownerId: null,
        phoneNumbers: [CRM_PRIMARY_PHONE, CRM_MOBILE_PHONE, CRM_FAX],
        rawData: {
          address: 'Test street 1',
          city: 'San Francisco',
          country: 'USA',
          createdate: DATE_STRING,
          email: 'primary@address.com',
          work_email: 'work@address.com',
          fax: '6934982349',
          firstname: 'Test',
          hs_object_id: '101',
          lastmodifieddate: DATE_STRING,
          lastname: 'Contact',
          mobilePhone: '1234567890',
          phone: '5102932345',
          state: 'CA',
          zip: '94043',
          _associations: {
            company: ['16984059819'],
          },
        },
        updatedAt: DATE,
      });
    });
  });
  describe('toHubspotContactCreateParams', () => {
    test('toHubspotContactCreateParams basic', () => {
      const params: ContactCreateParams = {
        firstName: 'Test',
        lastName: 'Contact',
        emailAddresses: [CRM_PRIMARY_EMAIL, CRM_WORK_EMAIL],
        phoneNumbers: [CRM_PRIMARY_PHONE, CRM_MOBILE_PHONE, CRM_FAX],
        addresses: [CRM_PRIMARY_ADDRESS],
        ownerId: '123',
        customFields: {
          custom1: 'value1',
          custom2: 'value2',
        },
      };
      expect(toHubspotContactCreateParams(params)).toEqual({
        address: 'Test street 1',
        city: 'San Francisco',
        country: 'USA',
        custom1: 'value1',
        custom2: 'value2',
        email: 'primary@address.com',
        fax: '6934982349',
        firstname: 'Test',
        hubspot_owner_id: '123',
        lastname: 'Contact',
        mobilephone: '1234567890',
        phone: '5102932345',
        state: 'CA',
        work_email: 'work@address.com',
        zip: '94043',
      });
    });
    test('toHubspotContactCreateParams partial', () => {
      const params: ContactCreateParams = {
        ownerId: '123',
        customFields: {
          custom1: 'value1',
        },
      };
      expect(toHubspotContactCreateParams(params)).toEqual({
        hubspot_owner_id: '123',
        custom1: 'value1',
      });
    });
  });
  describe('fromHubSpotDealToOpportunity', () => {
    test('fromHubSpotDealToOpportunity basic', () => {
      const hubspotDeal = {
        id: '14659412538',
        properties: {
          amount: '1835',
          closedate: DATE_STRING,
          createdate: DATE_STRING,
          dealname: 'Test Deal',
          dealstage: 'contractsent',
          hs_lastmodifieddate: DATE_STRING,
          hs_object_id: '14659412538',
          pipeline: 'default',
        },
        associations: {
          company: ['16984059819'],
        },
        createdAt: DATE_STRING,
        updatedAt: DATE_STRING,
        archived: false,
      };
      expect(fromHubSpotDealToOpportunity(hubspotDeal, HUBSPOT_PIPELINE_STAGE_MAPPING)).toEqual({
        accountId: '16984059819',
        amount: 1835,
        closeDate: DATE,
        createdAt: DATE,
        description: null,
        id: '14659412538',
        isDeleted: false,
        lastActivityAt: null,
        lastModifiedAt: DATE,
        name: 'Test Deal',
        ownerId: null,
        pipeline: 'Sales Pipeline',
        rawData: {
          amount: '1835',
          closedate: DATE_STRING,
          createdate: DATE_STRING,
          dealname: 'Test Deal',
          dealstage: 'contractsent',
          hs_lastmodifieddate: DATE_STRING,
          hs_object_id: '14659412538',
          pipeline: 'default',
          _associations: {
            company: ['16984059819'],
          },
        },
        stage: 'Contract Sent',
        status: 'OPEN',
        updatedAt: DATE,
      });
    });

    test('fromHubSpotDealToOpportunity invalid pipeline stage', () => {
      const hubspotDeal = {
        id: '14659412538',
        properties: {
          amount: '1835',
          closedate: DATE_STRING,
          createdate: DATE_STRING,
          dealname: 'Test Deal',
          dealstage: 'invalidstage',
          hs_lastmodifieddate: DATE_STRING,
          hs_object_id: '14659412538',
          pipeline: 'default',
        },
        associations: {
          company: ['16984059819'],
        },
        createdAt: DATE_STRING,
        updatedAt: DATE_STRING,
        archived: false,
      };
      expect(fromHubSpotDealToOpportunity(hubspotDeal, HUBSPOT_PIPELINE_STAGE_MAPPING)).toEqual({
        accountId: '16984059819',
        amount: 1835,
        closeDate: DATE,
        createdAt: DATE,
        description: null,
        id: '14659412538',
        isDeleted: false,
        lastActivityAt: null,
        lastModifiedAt: DATE,
        name: 'Test Deal',
        ownerId: null,
        pipeline: 'Sales Pipeline',
        rawData: {
          amount: '1835',
          closedate: DATE_STRING,
          createdate: DATE_STRING,
          dealname: 'Test Deal',
          dealstage: 'invalidstage',
          hs_lastmodifieddate: DATE_STRING,
          hs_object_id: '14659412538',
          pipeline: 'default',
          _associations: {
            company: ['16984059819'],
          },
        },
        stage: 'invalidstage',
        status: 'OPEN',
        updatedAt: DATE,
      });
    });
  });
  describe('toHubspotOpportunityCreateParams', () => {
    test('toHubspotOpportunityCreateParams basic', () => {
      const params: OpportunityCreateParams = {
        name: 'Test Deal',
        description: 'Test Deal Description',
        amount: 123,
        stage: 'Contract Sent',
        status: 'OPEN',
        closeDate: DATE,
        lastActivityAt: DATE,
        pipeline: 'Sales Pipeline',
        ownerId: '123',
        customFields: {
          custom1: 'value1',
          custom2: 'value2',
        },
      };
      expect(toHubspotOpportunityCreateParams(params, HUBSPOT_PIPELINE_STAGE_MAPPING)).toEqual({
        amount: '123',
        closedate: DATE_STRING,
        custom1: 'value1',
        custom2: 'value2',
        dealname: 'Test Deal',
        dealstage: 'contractsent',
        description: 'Test Deal Description',
        hubspot_owner_id: '123',
        pipeline: 'default',
      });
    });
    test('toHubspotOpportunityCreateParams partial', () => {
      const params: OpportunityCreateParams = {
        customFields: {
          custom1: 'value1',
          custom2: 'value2',
        },
      };
      expect(toHubspotOpportunityCreateParams(params, HUBSPOT_PIPELINE_STAGE_MAPPING)).toEqual({
        custom1: 'value1',
        custom2: 'value2',
      });
    });
    test('toHubspotOpportunityCreateParams invalid pipeline', () => {
      const params: OpportunityCreateParams = {
        name: 'Test Deal',
        description: 'Test Deal Description',
        amount: 123,
        stage: 'Contract Sent',
        status: 'OPEN',
        closeDate: DATE,
        lastActivityAt: DATE,
        pipeline: 'invalid pipeline',
        ownerId: '123',
        customFields: {
          custom1: 'value1',
          custom2: 'value2',
        },
      };
      expect(() => toHubspotOpportunityCreateParams(params, HUBSPOT_PIPELINE_STAGE_MAPPING)).toThrow(
        'Pipeline not found: invalid pipeline'
      );
    });
    test('toHubspotOpportunityCreateParams invalid stage', () => {
      const params: OpportunityCreateParams = {
        name: 'Test Deal',
        description: 'Test Deal Description',
        amount: 123,
        stage: 'invalidstage',
        status: 'OPEN',
        closeDate: DATE,
        lastActivityAt: DATE,
        pipeline: 'Custom Pipeline',
        ownerId: '123',
        customFields: {
          custom1: 'value1',
          custom2: 'value2',
        },
      };
      expect(() => toHubspotOpportunityCreateParams(params, HUBSPOT_PIPELINE_STAGE_MAPPING)).toThrow(
        'Stage not found: invalidstage'
      );
    });
  });
  describe('fromHubspotOwnerToUser', () => {
    test('fromHubspotOwnerToUser basic', () => {
      const hubspotOwner = {
        id: '123',
        ownerId: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        createdAt: DATE,
        updatedAt: DATE,
        archived: false,
        userId: 123,
        teams: [],
      };
      expect(fromHubspotOwnerToUser(hubspotOwner)).toEqual({
        createdAt: DATE,
        email: 'test@test.com',
        id: '123',
        isActive: true,
        isDeleted: false,
        lastModifiedAt: DATE,
        name: 'Test User',
        rawData: {
          archived: false,
          createdAt: DATE,
          email: 'test@test.com',
          firstName: 'Test',
          id: '123',
          lastName: 'User',
          teams: [],
          updatedAt: DATE,
          userId: 123,
        },
        updatedAt: DATE,
      });
    });
  });
  describe('toCustomObject', () => {
    test('should convert an ObjectSchema to a CustomObject', () => {
      const object = {
        name: 'TestObject',
        description: 'Test description',
        primaryDisplayProperty: 'name',
        labels: {
          singular: 'Test Singular',
          plural: 'Test Plural',
        },
        properties: [
          {
            name: 'name',
            label: 'Name',
            description: 'Name',
            type: 'string',
            fieldType: 'text',
          },
          {
            name: 'property1',
            label: 'Property 1',
            description: 'Description 1',
            type: 'string',
            fieldType: 'textarea',
          },
          {
            name: 'property2',
            label: 'Property 2',
            description: 'Description 2',
            type: 'number',
          },
          {
            name: 'property3',
            label: 'Property 3',
            description: 'Description 3',
            type: 'enumeration',
            fieldType: 'select',
          },
          {
            name: 'property4',
            label: 'Property 4',
            description: 'Description 4',
            type: 'enumeration',
            fieldType: 'checkbox',
          },
          {
            name: 'property5',
            label: 'Property 5',
            description: 'Description 5',
            type: 'bool',
          },
          {
            name: 'property6',
            label: 'Property 6',
            description: 'Description 6',
            type: 'date',
          },
          {
            name: 'property7',
            label: 'Property 7',
            description: 'Description 7',
            type: 'datetime',
          },
        ],
        requiredProperties: ['property1'],
      } as unknown as ObjectSchema;

      const customObject = toCustomObject(object);

      expect(customObject).toEqual({
        description: null,
        fields: [
          {
            description: 'Name',
            groupName: undefined,
            id: 'name',
            isRequired: false,
            label: 'Name',
            options: undefined,
            rawDetails: {
              description: 'Name',
              fieldType: 'text',
              label: 'Name',
              name: 'name',
              type: 'string',
            },
            type: 'text',
          },
          {
            description: 'Description 1',
            groupName: undefined,
            id: 'property1',
            isRequired: true,
            label: 'Property 1',
            options: undefined,
            rawDetails: {
              description: 'Description 1',
              fieldType: 'textarea',
              label: 'Property 1',
              name: 'property1',
              type: 'string',
            },
            type: 'textarea',
          },
          {
            description: 'Description 2',
            groupName: undefined,
            id: 'property2',
            isRequired: false,
            label: 'Property 2',
            options: undefined,
            rawDetails: {
              description: 'Description 2',
              label: 'Property 2',
              name: 'property2',
              type: 'number',
            },
            type: 'number',
          },
          {
            description: 'Description 3',
            groupName: undefined,
            id: 'property3',
            isRequired: false,
            label: 'Property 3',
            options: undefined,
            rawDetails: {
              description: 'Description 3',
              fieldType: 'select',
              label: 'Property 3',
              name: 'property3',
              type: 'enumeration',
            },
            type: 'picklist',
          },
          {
            description: 'Description 4',
            groupName: undefined,
            id: 'property4',
            isRequired: false,
            label: 'Property 4',
            options: undefined,
            rawDetails: {
              description: 'Description 4',
              fieldType: 'checkbox',
              label: 'Property 4',
              name: 'property4',
              type: 'enumeration',
            },
            type: 'multipicklist',
          },
          {
            description: 'Description 5',
            groupName: undefined,
            id: 'property5',
            isRequired: false,
            label: 'Property 5',
            options: undefined,
            rawDetails: {
              description: 'Description 5',
              label: 'Property 5',
              name: 'property5',
              type: 'bool',
            },
            type: 'boolean',
          },
          {
            description: 'Description 6',
            groupName: undefined,
            id: 'property6',
            isRequired: false,
            label: 'Property 6',
            options: undefined,
            rawDetails: {
              description: 'Description 6',
              label: 'Property 6',
              name: 'property6',
              type: 'date',
            },
            type: 'date',
          },
          {
            description: 'Description 7',
            groupName: undefined,
            id: 'property7',
            isRequired: false,
            label: 'Property 7',
            options: undefined,
            rawDetails: {
              description: 'Description 7',
              label: 'Property 7',
              name: 'property7',
              type: 'datetime',
            },
            type: 'datetime',
          },
        ],
        labels: {
          plural: 'Test Plural',
          singular: 'Test Singular',
        },
        name: 'TestObject',
        primaryFieldId: 'name',
      });
    });
  });

  describe('toPropertyUnified', () => {
    test('should convert a Property to a PropertyUnified', () => {
      const property = {
        name: 'property1',
        label: 'Property 1',
        description: 'Description 1',
        fieldType: 'text',
      } as HubspotProperty;

      const requiredSet = new Set(['property1']);
      const propertyUnified = toPropertyUnified(property, requiredSet);

      expect(propertyUnified).toEqual({
        id: 'property1',
        label: 'Property 1',
        description: 'Description 1',
        type: 'text',
        isRequired: true,
        groupName: undefined,
        rawDetails: {
          name: 'property1',
          label: 'Property 1',
          description: 'Description 1',
          fieldType: 'text',
        },
      });
    });
  });

  describe('getPropertyType', () => {
    test('should return the correct PropertyType', () => {
      expect(getPropertyType({ fieldType: 'text', type: 'string' } as HubspotProperty)).toEqual('text');
      expect(getPropertyType({ fieldType: 'textarea', type: 'string' } as HubspotProperty)).toEqual('textarea');
      expect(getPropertyType({ fieldType: 'number', type: 'number' } as HubspotProperty)).toEqual('number');
      expect(getPropertyType({ fieldType: 'select', type: 'enumeration' } as HubspotProperty)).toEqual('picklist');
      expect(getPropertyType({ fieldType: 'checkbox', type: 'enumeration' } as HubspotProperty)).toEqual(
        'multipicklist'
      );
      expect(getPropertyType({ type: 'date' } as HubspotProperty)).toEqual('date');
      expect(getPropertyType({ type: 'datetime' } as HubspotProperty)).toEqual('datetime');
      expect(getPropertyType({ type: 'bool' } as HubspotProperty)).toEqual('boolean');
      expect(getPropertyType({ fieldType: 'unknown', type: 'unknown' } as HubspotProperty)).toEqual('other');
    });
  });

  describe('toRawDetails', () => {
    test('should convert a Property to a Record<string, unknown>', () => {
      const property = {
        name: 'property1',
        label: 'Property 1',
        description: 'Description 1',
        fieldType: 'text',
      } as HubspotProperty;

      const rawDetails = toRawDetails(property);

      expect(rawDetails).toEqual(property);
    });
  });
  describe('toHubspotTypeAndFieldType', () => {
    test('should return the correct type and fieldType for text', () => {
      const propertyType: PropertyType = 'text';

      const result = toHubspotTypeAndFieldType(propertyType);

      expect(result).toEqual({ type: 'string', fieldType: 'text' });
    });

    test('should return the correct type and fieldType for textarea', () => {
      const propertyType: PropertyType = 'textarea';

      const result = toHubspotTypeAndFieldType(propertyType);

      expect(result).toEqual({ type: 'string', fieldType: 'textarea' });
    });

    test('should return the correct type and fieldType for number', () => {
      const propertyType: PropertyType = 'number';

      const result = toHubspotTypeAndFieldType(propertyType);

      expect(result).toEqual({ type: 'number', fieldType: 'number' });
    });

    test('should return the correct type and fieldType for picklist', () => {
      const propertyType: PropertyType = 'picklist';

      const result = toHubspotTypeAndFieldType(propertyType);

      expect(result).toEqual({ type: 'enumeration', fieldType: 'select' });
    });

    test('should return the correct type and fieldType for multipicklist', () => {
      const propertyType: PropertyType = 'multipicklist';

      const result = toHubspotTypeAndFieldType(propertyType);

      expect(result).toEqual({ type: 'enumeration', fieldType: 'checkbox' });
    });

    test('should return the correct type and fieldType for date', () => {
      const propertyType: PropertyType = 'date';

      const result = toHubspotTypeAndFieldType(propertyType);

      expect(result).toEqual({ type: 'date', fieldType: 'date' });
    });

    test('should return the correct type and fieldType for datetime', () => {
      const propertyType: PropertyType = 'datetime';

      const result = toHubspotTypeAndFieldType(propertyType);

      expect(result).toEqual({ type: 'datetime', fieldType: 'date' });
    });

    test('should return the correct type and fieldType for boolean', () => {
      const propertyType: PropertyType = 'boolean';

      const result = toHubspotTypeAndFieldType(propertyType);

      expect(result).toEqual({ type: 'bool', fieldType: 'booleancheckbox' });
    });

    test('should return the default type and fieldType for an unknown type', () => {
      const propertyType: PropertyType = 'other';

      const result = toHubspotTypeAndFieldType(propertyType);

      expect(result).toEqual({ type: 'string', fieldType: 'text' });
    });
  });
});
