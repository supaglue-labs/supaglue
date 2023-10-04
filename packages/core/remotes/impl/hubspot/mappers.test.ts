/**
 * Tests Hubspot mappers
 *
 * @group unit/mappers/hubspot
 */

import { describe, expect, test } from '@jest/globals';
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
  toHubspotAccountCreateParams,
  toHubspotContactCreateParams,
  toHubspotOpportunityCreateParams,
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
});
