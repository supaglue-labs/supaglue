/**
 * Tests Salesforce mappers
 *
 * @group unit/mappers/salesforce
 */

import { describe, expect, test } from '@jest/globals';
import type { Address } from '@supaglue/types/crm/common';
import type { DescribeSObjectResult } from 'jsforce';
import {
  CRM_BILLING_ADDRESS,
  CRM_FAX,
  CRM_MAILING_ADDRESS,
  CRM_MOBILE_PHONE,
  CRM_OTHER_ADDRESS,
  CRM_PRIMARY_ADDRESS,
  CRM_PRIMARY_EMAIL,
  CRM_PRIMARY_PHONE,
  CRM_SHIPPING_ADDRESS,
  DATE,
  DATE_STRING,
} from '../../utils/test_data';
import {
  fromSalesforceAccountToAccount,
  fromSalesforceContactToContact,
  fromSalesforceLeadToLead,
  fromSalesforceOpportunityToOpportunity,
  fromSalesforceUserToUser,
  toCustomObject,
  toSalesforceAccountAddressCreateParams,
  toSalesforceAccountCreateParams,
  toSalesforceContactAddressCreateParams,
  toSalesforceContactCreateParams,
  toSalesforceLeadCreateParams,
  toSalesforceOpportunityCreateParams,
} from './mappers';

describe('Salesforce Mappers', () => {
  describe('fromSalesforceAccountToAccount', () => {
    test('should correctly convert billing and shipping addresses', () => {
      const record = {
        BillingCity: 'Test City',
        BillingCountry: 'Test Country',
        BillingPostalCode: '12345',
        BillingState: 'Test State',
        BillingStreet: 'Test Street',
        ShippingCity: 'Ship City',
        ShippingCountry: 'Ship Country',
        ShippingPostalCode: '67890',
        ShippingState: 'Ship State',
        ShippingStreet: 'Ship Street',
      };

      const result = fromSalesforceAccountToAccount(record);
      expect(result.addresses).toEqual([
        {
          street1: 'Test Street',
          street2: null,
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country',
          addressType: 'billing',
        },
        {
          street1: 'Ship Street',
          street2: null,
          city: 'Ship City',
          state: 'Ship State',
          postalCode: '67890',
          country: 'Ship Country',
          addressType: 'shipping',
        },
      ]);
    });

    test('should correctly convert phone numbers', () => {
      const record = {
        Phone: '1234567890',
        Fax: '0987654321',
      };

      const result = fromSalesforceAccountToAccount(record);
      expect(result.phoneNumbers).toEqual([
        {
          phoneNumber: '1234567890',
          phoneNumberType: 'primary',
        },
        {
          phoneNumber: '0987654321',
          phoneNumberType: 'fax',
        },
      ]);
    });

    test('should handle default values correctly', () => {
      const record = {
        Id: '1',
        Name: 'Test',
        IsDeleted: 'true',
        SystemModstamp: DATE_STRING,
      };

      const result = fromSalesforceAccountToAccount(record);
      expect(result).toEqual({
        id: '1',
        name: 'Test',
        description: null,
        ownerId: null,
        industry: null,
        website: null,
        numberOfEmployees: null,
        addresses: [],
        phoneNumbers: [],
        lifecycleStage: null,
        lastActivityAt: null,
        createdAt: null,
        updatedAt: DATE,
        isDeleted: true,
        lastModifiedAt: DATE,
        rawData: record,
      });
    });
  });

  describe('toSalesforceAccountCreateParams', () => {
    test('should convert account creation params to Salesforce account params', () => {
      const accountParams = {
        name: 'Test Account',
        description: 'Test Description',
        industry: 'Tech',
        website: 'https://example.com',
        numberOfEmployees: 10,
        addresses: [CRM_SHIPPING_ADDRESS, CRM_BILLING_ADDRESS],
        phoneNumbers: [CRM_PRIMARY_PHONE],
        customFields: {
          CustomField1: 'CustomValue1',
        },
      };

      const result = toSalesforceAccountCreateParams(accountParams);
      expect(result).toEqual({
        BillingCity: 'San Francisco',
        BillingCountry: 'USA',
        BillingPostalCode: '94043',
        BillingState: 'CA',
        BillingStreet: 'Billing street 1',
        CustomField1: 'CustomValue1',
        Description: 'Test Description',
        Fax: '',
        Industry: 'Tech',
        Name: 'Test Account',
        NumberOfEmployees: 10,
        Phone: '5102932345',
        ShippingCity: 'San Francisco',
        ShippingCountry: 'USA',
        ShippingPostalCode: '94043',
        ShippingState: 'CA',
        ShippingStreet: 'Shipping street 1',
        Website: 'https://example.com',
      });
    });
    test('partial params should only update specified fields', () => {
      const partialParams = {
        description: 'Test Description',
        customFields: {
          CustomField1: 'CustomValue1',
        },
      };

      const result = toSalesforceAccountCreateParams(partialParams);
      expect(result).toEqual({
        CustomField1: 'CustomValue1',
        Description: 'Test Description',
      });
    });
  });

  describe('toSalesforceAccountAddressCreateParams', () => {
    test('should correctly convert shipping and billing addresses', () => {
      const addresses = [CRM_SHIPPING_ADDRESS, CRM_BILLING_ADDRESS];

      const result = toSalesforceAccountAddressCreateParams(addresses);
      expect(result).toEqual({
        BillingCity: 'San Francisco',
        BillingCountry: 'USA',
        BillingPostalCode: '94043',
        BillingState: 'CA',
        BillingStreet: 'Billing street 1',
        ShippingCity: 'San Francisco',
        ShippingCountry: 'USA',
        ShippingPostalCode: '94043',
        ShippingState: 'CA',
        ShippingStreet: 'Shipping street 1',
      });
    });

    test('should return empty strings for undefined address values', () => {
      const addresses: Address[] = [
        {
          addressType: 'shipping',
          street1: 'Ship Street',
          street2: null,
          city: null,
          state: null,
          postalCode: null,
          country: null,
        },
      ];

      const result = toSalesforceAccountAddressCreateParams(addresses);
      expect(result).toEqual({
        BillingCity: '',
        BillingCountry: '',
        BillingPostalCode: '',
        BillingState: '',
        BillingStreet: '',
        ShippingCity: '',
        ShippingCountry: '',
        ShippingPostalCode: '',
        ShippingState: '',
        ShippingStreet: 'Ship Street',
      });
    });
  });

  describe('toSalesforceContactAddressCreateParams', () => {
    test('should correctly convert mailing and other addresses', () => {
      const addresses = [CRM_MAILING_ADDRESS, CRM_OTHER_ADDRESS];

      const result = toSalesforceContactAddressCreateParams(addresses);
      expect(result).toEqual({
        MailingCity: 'San Francisco',
        MailingCountry: 'USA',
        MailingPostalCode: '94043',
        MailingState: 'CA',
        MailingStreet: 'Mailing street 1',
        OtherCity: 'San Francisco',
        OtherCountry: 'USA',
        OtherPostalCode: '94043',
        OtherState: 'CA',
        OtherStreet: 'Other street 1',
      });
    });

    test('should return empty strings for null address values', () => {
      const addresses: Address[] = [
        {
          addressType: 'mailing',
          street1: 'Mail Street',
          street2: null,
          city: null,
          state: null,
          postalCode: null,
          country: null,
        },
      ];

      const result = toSalesforceContactAddressCreateParams(addresses);
      expect(result).toEqual({
        MailingStreet: 'Mail Street',
        MailingCity: '',
        MailingState: '',
        MailingPostalCode: '',
        MailingCountry: '',
        OtherCity: '',
        OtherCountry: '',
        OtherPostalCode: '',
        OtherState: '',
        OtherStreet: '',
      });
    });
  });

  describe('fromSalesforceContactToContact', () => {
    test('should correctly convert a Salesforce Contact record to Contact', () => {
      const salesforceContact = {
        Id: '1',
        AccountId: '12345',
        OwnerId: '67890',
        FirstName: 'John',
        LastName: 'Doe',
        MailingStreet: CRM_MAILING_ADDRESS.street1,
        MailingCity: CRM_MAILING_ADDRESS.city,
        MailingState: CRM_MAILING_ADDRESS.state,
        MailingPostalCode: CRM_MAILING_ADDRESS.postalCode,
        MailingCountry: CRM_MAILING_ADDRESS.country,
        OtherStreet: CRM_OTHER_ADDRESS.street1,
        OtherCity: CRM_OTHER_ADDRESS.city,
        OtherState: CRM_OTHER_ADDRESS.state,
        OtherPostalCode: CRM_OTHER_ADDRESS.postalCode,
        OtherCountry: CRM_OTHER_ADDRESS.country,
        Phone: CRM_PRIMARY_PHONE.phoneNumber,
        MobilePhone: CRM_MOBILE_PHONE.phoneNumber,
        Fax: CRM_FAX.phoneNumber,
        Email: CRM_PRIMARY_EMAIL.emailAddress,
        LastActivityDate: DATE_STRING,
        CreatedDate: DATE_STRING,
        SystemModstamp: DATE_STRING,
        IsDeleted: 'true',
      };

      const expectedOutput = {
        id: '1',
        accountId: '12345',
        ownerId: '67890',
        firstName: 'John',
        lastName: 'Doe',
        addresses: [CRM_MAILING_ADDRESS, CRM_OTHER_ADDRESS],
        emailAddresses: [CRM_PRIMARY_EMAIL],
        phoneNumbers: [CRM_PRIMARY_PHONE, CRM_MOBILE_PHONE, CRM_FAX],
        lifecycleStage: null,
        lastActivityAt: DATE,
        createdAt: DATE,
        updatedAt: DATE,
        isDeleted: true,
        lastModifiedAt: DATE,
        rawData: salesforceContact,
      };

      const result = fromSalesforceContactToContact(salesforceContact);
      expect(result).toEqual(expectedOutput);
    });

    test('should handle a Salesforce Contact record with missing optional fields', () => {
      const salesforceContact = {
        Id: '2',
        LastName: 'Smith',
      };

      const expectedOutput = {
        id: '2',
        accountId: null,
        ownerId: null,
        firstName: null,
        lastName: 'Smith',
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
        lifecycleStage: null,
        lastActivityAt: null,
        createdAt: null,
        updatedAt: null,
        isDeleted: false,
        lastModifiedAt: new Date(0),
        rawData: salesforceContact,
      };

      const result = fromSalesforceContactToContact(salesforceContact);
      expect(result).toEqual(expectedOutput);
    });
  });
  describe('toSalesforceContactCreateParams', () => {
    test('should correctly convert ContactCreateParams to Salesforce Contact create params', () => {
      const contactParams = {
        firstName: 'John',
        lastName: 'Doe',
        accountId: '12345',
        emailAddresses: [CRM_PRIMARY_EMAIL],
        addresses: [CRM_MAILING_ADDRESS, CRM_OTHER_ADDRESS],
        phoneNumbers: [CRM_PRIMARY_PHONE, CRM_MOBILE_PHONE],
        customFields: {
          CustomField1: 'Value1',
          CustomField2: 'Value2',
        },
      };

      const expectedOutput = {
        FirstName: 'John',
        LastName: 'Doe',
        AccountId: '12345',
        Email: CRM_PRIMARY_EMAIL.emailAddress,
        MobilePhone: CRM_MOBILE_PHONE.phoneNumber,
        Phone: CRM_PRIMARY_PHONE.phoneNumber,
        Fax: '',
        MailingCity: 'San Francisco',
        MailingCountry: 'USA',
        MailingPostalCode: '94043',
        MailingState: 'CA',
        MailingStreet: 'Mailing street 1',
        OtherCity: 'San Francisco',
        OtherCountry: 'USA',
        OtherPostalCode: '94043',
        OtherState: 'CA',
        OtherStreet: 'Other street 1',
        CustomField1: 'Value1',
        CustomField2: 'Value2',
      };

      const result = toSalesforceContactCreateParams(contactParams);
      expect(result).toEqual(expectedOutput);
    });

    test('should handle missing optional fields', () => {
      const contactParams = {
        firstName: 'Jane',
        lastName: 'Smith',
        // Other fields are intentionally left out
      };

      const expectedOutput = {
        FirstName: 'Jane',
        LastName: 'Smith',
      };

      const result = toSalesforceContactCreateParams(contactParams);
      expect(result).toEqual(expectedOutput);
    });

    test('should handle empty arrays for email and phone numbers', () => {
      const contactParams = {
        firstName: 'Alice',
        lastName: 'Adams',
        emailAddresses: [],
        phoneNumbers: [],
      };

      const expectedOutput = {
        FirstName: 'Alice',
        LastName: 'Adams',
        Phone: '',
        MobilePhone: '',
        Fax: '',
        Email: '',
      };

      const result = toSalesforceContactCreateParams(contactParams);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('fromSalesforceLeadToLead', () => {
    test('should correctly convert Salesforce record to Lead object', () => {
      const record = {
        Id: 'lead123',
        FirstName: 'John',
        LastName: 'Doe',
        OwnerId: 'owner123',
        Title: 'Mr.',
        Company: 'Acme Corp',
        ConvertedDate: '2023-08-17',
        LeadSource: 'Web',
        ConvertedAccountId: 'account123',
        ConvertedContactId: 'contact123',
        Street: '123 Acme St',
        City: 'Metropolis',
        State: 'ST',
        Country: 'Countryland',
        PostalCode: '12345',
        Email: 'johndoe@example.com',
        Phone: '(123) 456-7890',
        CreatedDate: '2023-08-01T12:00:00Z',
        SystemModstamp: '2023-08-02T12:00:00Z',
        IsDeleted: 'false',
      };

      const expectedOutput = {
        id: 'lead123',
        firstName: 'John',
        lastName: 'Doe',
        ownerId: 'owner123',
        title: 'Mr.',
        company: 'Acme Corp',
        convertedDate: new Date('2023-08-17'),
        leadSource: 'Web',
        convertedAccountId: 'account123',
        convertedContactId: 'contact123',
        addresses: [
          {
            street1: '123 Acme St',
            street2: null,
            city: 'Metropolis',
            state: 'ST',
            country: 'Countryland',
            postalCode: '12345',
            addressType: 'primary',
          },
        ],
        emailAddresses: [{ emailAddress: 'johndoe@example.com', emailAddressType: 'primary' }],
        phoneNumbers: [{ phoneNumber: '(123) 456-7890', phoneNumberType: 'primary' }],
        createdAt: new Date('2023-08-01T12:00:00Z'),
        updatedAt: new Date('2023-08-02T12:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-08-02T12:00:00Z'),
        rawData: record,
      };

      const result = fromSalesforceLeadToLead(record);
      expect(result).toEqual(expectedOutput);
    });

    test('should handle missing optional fields', () => {
      const record = {
        Id: 'lead234',
        // Other fields are intentionally left out
      };

      const expectedOutput = {
        id: 'lead234',
        firstName: null,
        lastName: null,
        ownerId: null,
        title: null,
        company: null,
        convertedDate: null,
        leadSource: null,
        convertedAccountId: null,
        convertedContactId: null,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
        createdAt: null,
        updatedAt: null,
        isDeleted: false,
        lastModifiedAt: new Date(0),
        rawData: record,
      };

      const result = fromSalesforceLeadToLead(record);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('toSalesforceLeadCreateParams', () => {
    test('should correctly map LeadCreateParams to Salesforce format', () => {
      const leadCreateParams = {
        firstName: 'John',
        lastName: 'Doe',
        title: 'Mr.',
        leadSource: 'Web',
        company: 'Acme Corp',
        emailAddresses: [CRM_PRIMARY_EMAIL],
        addresses: [CRM_PRIMARY_ADDRESS],
        customFields: {
          SomeCustomField: 'Value',
        },
      };

      const expectedOutput = {
        FirstName: 'John',
        LastName: 'Doe',
        Title: 'Mr.',
        LeadSource: 'Web',
        Company: 'Acme Corp',
        Email: CRM_PRIMARY_EMAIL.emailAddress,
        Street: CRM_PRIMARY_ADDRESS.street1,
        City: CRM_PRIMARY_ADDRESS.city,
        State: CRM_PRIMARY_ADDRESS.state,
        Zip: CRM_PRIMARY_ADDRESS.postalCode,
        Country: CRM_PRIMARY_ADDRESS.country,
        SomeCustomField: 'Value',
      };

      const result = toSalesforceLeadCreateParams(leadCreateParams);
      expect(result).toEqual(expectedOutput);
    });

    test('should handle missing optional fields', () => {
      const leadCreateParams = {
        firstName: 'John',
        lastName: 'Doe',
        // Other fields are intentionally left out
      };

      const expectedOutput = {
        FirstName: 'John',
        LastName: 'Doe',
      };

      const result = toSalesforceLeadCreateParams(leadCreateParams);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('fromSalesforceOpportunityToOpportunity', () => {
    test('should correctly map Salesforce opportunity with all fields', () => {
      const salesforceOpportunity = {
        Id: 'opp123',
        Name: 'TestOpportunity',
        Description: 'TestDescription',
        OwnerId: 'owner123',
        IsWon: 'false',
        IsClosed: 'false',
        StageName: 'Prospect',
        CloseDate: DATE_STRING,
        AccountId: 'acc123',
        Amount: '1000',
        LastActivityDate: DATE_STRING,
        CreatedDate: DATE_STRING,
        SystemModstamp: DATE_STRING,
        IsDeleted: 'false',
      };

      const expectedOutput = {
        id: 'opp123',
        name: 'TestOpportunity',
        description: 'TestDescription',
        ownerId: 'owner123',
        status: 'OPEN',
        stage: 'Prospect',
        closeDate: DATE,
        accountId: 'acc123',
        pipeline: null,
        amount: 1000,
        lastActivityAt: DATE,
        createdAt: DATE,
        updatedAt: DATE,
        isDeleted: false,
        lastModifiedAt: DATE,
        rawData: salesforceOpportunity,
      };

      const result = fromSalesforceOpportunityToOpportunity(salesforceOpportunity);
      expect(result).toEqual(expectedOutput);
    });

    test('should handle won opportunity', () => {
      const salesforceOpportunity = {
        Id: 'opp123',
        Name: 'TestOpportunity',
        IsWon: 'true',
        IsClosed: 'false',
      };

      const result = fromSalesforceOpportunityToOpportunity(salesforceOpportunity);
      expect(result.status).toEqual('WON');
    });

    test('should handle lost opportunity', () => {
      const salesforceOpportunity = {
        Id: 'opp123',
        Name: 'TestOpportunity',
        IsWon: 'false',
        IsClosed: 'true',
      };

      const result = fromSalesforceOpportunityToOpportunity(salesforceOpportunity);
      expect(result.status).toEqual('LOST');
    });

    test('should handle missing optional fields', () => {
      const salesforceOpportunity = {
        Id: 'opp123',
        Name: 'TestOpportunity',
      };

      const expectedOutput = {
        id: 'opp123',
        name: 'TestOpportunity',
        description: null,
        ownerId: null,
        status: 'OPEN',
        stage: undefined,
        closeDate: null,
        accountId: null,
        pipeline: null,
        amount: null,
        lastActivityAt: null,
        createdAt: null,
        updatedAt: null,
        isDeleted: false,
        lastModifiedAt: new Date(0),
        rawData: salesforceOpportunity,
      };

      const result = fromSalesforceOpportunityToOpportunity(salesforceOpportunity);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('toSalesforceOpportunityCreateParams', () => {
    test('should correctly map all opportunity fields', () => {
      const opportunityParams = {
        amount: 1000,
        closeDate: DATE,
        description: 'TestDescription',
        name: 'TestOpportunity',
        stage: 'Prospect',
        accountId: 'acc123',
        customFields: {
          CustomField1: 'value1',
          CustomField2: 'value2',
        },
      };

      const expectedOutput = {
        Amount: 1000,
        CloseDate: DATE,
        Description: 'TestDescription',
        Name: 'TestOpportunity',
        StageName: 'Prospect',
        AccountId: 'acc123',
        CustomField1: 'value1',
        CustomField2: 'value2',
      };

      const result = toSalesforceOpportunityCreateParams(opportunityParams);
      expect(result).toEqual(expectedOutput);
    });

    test('should handle missing optional fields', () => {
      const opportunityParams = {
        name: 'TestOpportunity',
      };

      const expectedOutput = {
        Name: 'TestOpportunity',
      };

      const result = toSalesforceOpportunityCreateParams(opportunityParams);
      expect(result).toEqual(expectedOutput);
    });

    test('should correctly include custom fields', () => {
      const opportunityParams = {
        name: 'TestOpportunity',
        customFields: {
          CustomField1: 'value1',
        },
      };

      const expectedOutput = {
        Name: 'TestOpportunity',
        CustomField1: 'value1',
      };

      const result = toSalesforceOpportunityCreateParams(opportunityParams);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('fromSalesforceUserToUser function', () => {
    test('should correctly map Salesforce record to User', () => {
      const salesforceRecord = {
        Id: '123',
        Name: 'John Doe',
        Email: 'john@example.com',
        IsActive: true,
        CreatedDate: DATE_STRING,
        SystemModstamp: DATE_STRING,
        IsDeleted: 'false',
      };

      const expectedUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        createdAt: DATE,
        updatedAt: DATE,
        isDeleted: false,
        lastModifiedAt: DATE,
        rawData: salesforceRecord,
      };

      expect(fromSalesforceUserToUser(salesforceRecord)).toEqual(expectedUser);
    });

    test('should handle null date fields', () => {
      const salesforceRecord = {
        Id: '123',
        Name: 'John Doe',
        Email: 'john@example.com',
        IsActive: true,
        CreatedDate: null,
        SystemModstamp: null,
        IsDeleted: 'false',
      };

      const expectedUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        createdAt: null,
        updatedAt: null,
        isDeleted: false,
        lastModifiedAt: new Date(0),
        rawData: salesforceRecord,
      };

      expect(fromSalesforceUserToUser(salesforceRecord)).toEqual(expectedUser);
    });
  });

  describe('toCustomObject', () => {
    test('should correctly convert a SalesforceCustomObject to CustomObject', () => {
      const salesforceCustomObject = {
        name: 'TestFullName',
        label: 'TestLabel',
        labelPlural: 'TestPluralLabel',
        fields: [
          {
            name: 'TestField',
            label: 'TestLabel',
            type: 'string',
            nameField: true,
            nillable: false,
          },
          {
            name: 'TestField1',
            label: 'FieldLabel1',
            type: 'string',
            nillable: false,
          },
        ],
      } as DescribeSObjectResult;

      const expectedOutput = {
        id: 'TestFullName',
        name: 'TestFullName',
        description: null,
        labels: {
          singular: 'TestLabel',
          plural: 'TestPluralLabel',
        },
        primaryFieldKeyName: 'Name',
        fields: [
          {
            keyName: 'Name',
            displayName: 'TestLabel',
            fieldType: 'string',
            isRequired: true,
          },
          {
            keyName: 'TestField1',
            displayName: 'FieldLabel1',
            fieldType: 'string',
            isRequired: true,
          },
        ],
      };

      const result = toCustomObject(salesforceCustomObject);
      expect(result).toEqual(expectedOutput);
    });
  });
});
