import { describe, expect, test } from '@jest/globals';
import type {
  AccountCreateParams,
  Contact,
  ContactCreateParams,
  Lead,
  LeadCreateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityStatus,
  User,
} from '@supaglue/types/crm';
import type { Address, EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';
import type { DefinedFieldMappingConfig, InheritedFieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { toMappedProperties } from '../../utils/properties';
import type { DynamicsAccount, DynamicsContact, DynamicsLead, DynamicsOpportunity, DynamicsUser } from './mappers';
import {
  fromDynamicsAccountToRemoteAccount,
  fromDynamicsContactToRemoteContact,
  fromDynamicsLeadToRemoteLead,
  fromDynamicsOpportunityToRemoteOpportunity,
  fromDynamicsUserToRemoteUser,
  industryNameToCode,
  toDynamicsAccountCreateParams,
  toDynamicsAddresses,
  toDynamicsContactCreateParams,
  toDynamicsEmailAddresses,
  toDynamicsLeadCreateParams,
  toDynamicsOpportunityCreateParams,
  toDynamicsPhoneNumbers,
} from './mappers';
describe('ms_dynamics_365_sales/mappers', () => {
  const mockInheritedFieldMappingConfig: InheritedFieldMappingConfig = {
    type: 'inherit_all_fields',
  };
  const mockDefinedFieldMappingConfig: DefinedFieldMappingConfig = {
    type: 'defined',
    coreFieldMappings: [
      { schemaField: 'accountid', mappedField: 'remoteAccountId' },
      { schemaField: 'name', mappedField: 'remoteName' },
      { schemaField: 'description', mappedField: 'remoteDescription' },
    ],
    additionalFieldMappings: [
      { schemaField: 'websiteurl', mappedField: 'remoteWebsiteURL' },
      { schemaField: 'industrycode', mappedField: 'remoteIndustryCode' },
    ],
  };
  const mockDynamicsAccount: DynamicsAccount = {
    accountid: '123456',
    name: 'Test Account',
    description: 'Test Description',
    websiteurl: 'http://test.com',
    industrycode: 1,
    numberofemployees: 100,
    address1_line1: '123 Main St',
    address1_line2: 'Suite 101',
    address1_city: 'Test City',
    address1_stateorprovince: 'Test State',
    address1_postalcode: '12345',
    address1_country: 'Test Country',
    address1_addresstypecode: 1,
    address2_line1: null,
    address2_line2: null,
    address2_city: null,
    address2_stateorprovince: null,
    address2_postalcode: null,
    address2_country: null,
    address2_addresstypecode: null,
    telephone1: '123-456-7890',
    telephone2: null,
    telephone3: null,
    _ownerid_value: 'owner123',
    createdon: '2022-01-01T00:00:00Z',
    overriddencreatedon: null,
    modifiedon: '2022-01-02T00:00:00Z',
  };

  describe('fromDynamicsAccountToRemoteAccount', () => {
    test('converts a DynamicsAccount to Account correctly', () => {
      const result = fromDynamicsAccountToRemoteAccount(mockDynamicsAccount, mockDefinedFieldMappingConfig);

      expect(result).toEqual({
        id: mockDynamicsAccount.accountid,
        addresses: [
          {
            street1: mockDynamicsAccount.address1_line1,
            street2: mockDynamicsAccount.address1_line2,
            city: mockDynamicsAccount.address1_city,
            state: mockDynamicsAccount.address1_stateorprovince,
            postalCode: mockDynamicsAccount.address1_postalcode,
            country: mockDynamicsAccount.address1_country,
            addressType: 'billing',
          },
        ],
        industry: 'Accounting', // assuming industrycode 1 maps to 'Agriculture'
        numberOfEmployees: mockDynamicsAccount.numberofemployees,
        website: mockDynamicsAccount.websiteurl,
        createdAt: new Date(mockDynamicsAccount.createdon),
        updatedAt: new Date(mockDynamicsAccount.modifiedon),
        lastModifiedAt: new Date(mockDynamicsAccount.modifiedon),
        isDeleted: false,
        rawData: toMappedProperties(mockDynamicsAccount, mockDefinedFieldMappingConfig),
        name: mockDynamicsAccount.name,
        description: mockDynamicsAccount.description,
        ownerId: mockDynamicsAccount._ownerid_value,
        lastActivityAt: null,
        lifecycleStage: null,
        phoneNumbers: [
          {
            phoneNumber: mockDynamicsAccount.telephone1,
            phoneNumberType: 'primary',
          },
        ],
      });
    });
  });
  describe('fromDynamicsContactToRemoteContact', () => {
    test('converts basic dynamics contact to remote contact without optional fields', () => {
      const mockDynamicsContact: DynamicsContact = {
        contactid: '12345',
        firstname: 'John',
        lastname: 'Doe',
        description: null,
        address1_line1: null,
        address1_line2: null,
        address1_city: null,
        address1_stateorprovince: null,
        address1_postalcode: null,
        address1_country: null,
        address1_addresstypecode: null,
        address2_line1: null,
        address2_line2: null,
        address2_city: null,
        address2_stateorprovince: null,
        address2_postalcode: null,
        address2_country: null,
        address2_addresstypecode: null,
        address3_line1: null,
        address3_line2: null,
        address3_city: null,
        address3_stateorprovince: null,
        address3_postalcode: null,
        address3_country: null,
        address3_addresstypecode: null,
        telephone1: null,
        telephone2: null,
        telephone3: null,
        emailaddress1: null,
        emailaddress2: null,
        emailaddress3: null,
        _ownerid_value: 'abcdef',
        createdon: '2022-01-01T12:00:00Z',
        overriddencreatedon: null,
        modifiedon: '2023-01-01T12:00:00Z',
        _parentcustomerid_value: '56789',
      };

      const expectedContact: Contact = {
        id: '12345',
        accountId: '56789',
        ownerId: 'abcdef',
        firstName: 'John',
        lastName: 'Doe',
        addresses: [],
        phoneNumbers: [],
        emailAddresses: [],
        lifecycleStage: null,
        lastActivityAt: null,
        createdAt: new Date('2022-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z'),
        lastModifiedAt: new Date('2023-01-01T12:00:00Z'),
        isDeleted: false,
        rawData: mockDynamicsContact,
      };

      const result = fromDynamicsContactToRemoteContact(mockDynamicsContact, mockInheritedFieldMappingConfig);

      expect(result).toEqual(expectedContact);
    });

    test('converts dynamics contact with addresses, phone numbers, and email addresses', () => {
      const mockDynamicsContact: DynamicsContact = {
        contactid: '12345',
        firstname: 'John',
        lastname: 'Doe',
        description: null,
        address1_line1: '123 Main St',
        address1_line2: null,
        address1_city: 'Springfield',
        address1_stateorprovince: null,
        address1_postalcode: '12345',
        address1_country: null,
        address1_addresstypecode: 1,
        address2_line1: null,
        address2_line2: null,
        address2_city: null,
        address2_stateorprovince: null,
        address2_postalcode: null,
        address2_country: null,
        address2_addresstypecode: null,
        address3_line1: null,
        address3_line2: null,
        address3_city: null,
        address3_stateorprovince: null,
        address3_postalcode: null,
        address3_country: null,
        address3_addresstypecode: null,
        telephone1: '(555) 123-4567',
        telephone2: '(555) 765-4321',
        telephone3: null,
        emailaddress1: 'john.doe@example.com',
        emailaddress2: 'j.doe@workplace.com',
        emailaddress3: null,
        _ownerid_value: 'abcdef',
        createdon: '2022-01-01T12:00:00Z',
        overriddencreatedon: null,
        modifiedon: '2023-01-01T12:00:00Z',
        _parentcustomerid_value: '56789',
      };

      const expectedContact: Contact = {
        id: '12345',
        accountId: '56789',
        ownerId: 'abcdef',
        firstName: 'John',
        lastName: 'Doe',
        addresses: [
          {
            street1: '123 Main St',
            street2: null,
            city: 'Springfield',
            state: null,
            postalCode: '12345',
            addressType: 'billing',
            country: null,
          },
        ],
        phoneNumbers: [
          { phoneNumber: '(555) 123-4567', phoneNumberType: 'primary' },
          { phoneNumber: '(555) 765-4321', phoneNumberType: 'other' },
        ],
        emailAddresses: [
          { emailAddress: 'john.doe@example.com', emailAddressType: 'primary' },
          { emailAddress: 'j.doe@workplace.com', emailAddressType: 'other' },
        ],
        lifecycleStage: null,
        lastActivityAt: null,
        createdAt: new Date('2022-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z'),
        lastModifiedAt: new Date('2023-01-01T12:00:00Z'),
        isDeleted: false,
        rawData: mockDynamicsContact,
      };

      const result = fromDynamicsContactToRemoteContact(mockDynamicsContact, mockInheritedFieldMappingConfig);

      expect(result).toEqual(expectedContact);
    });
  });
  describe('fromDynamicsOpportunityToRemoteOpportunity', () => {
    test('converts basic dynamics opportunity without optional fields', () => {
      const mockDynamicsOpportunity: DynamicsOpportunity = {
        opportunityid: '12345',
        name: 'Opportunity A',
        description: null,
        statuscode: 1,
        actualvalue: 10000,
        actualclosedate: null,
        stepname: 'Initial',
        overriddencreatedon: null,
        createdon: '2022-01-01T12:00:00Z',
        modifiedon: '2023-01-01T12:00:00Z',
        _ownerid_value: 'abcdef',
        _parentaccountid_value: '56789',
        stageid_processstage: null,
        'stageid_processstage@odata.nextLink': 'link1',
        opportunity_leadtoopportunitysalesprocess: null,
        'opportunity_leadtoopportunitysalesprocess@odata.nextLink': 'link2',
      };

      const expectedOpportunity: Opportunity = {
        id: '12345',
        name: 'Opportunity A',
        description: null,
        ownerId: 'abcdef',
        lastActivityAt: null,
        status: 'OPEN',
        pipeline: null,
        accountId: '56789',
        amount: 10000,
        closeDate: null,
        stage: 'Initial',
        createdAt: new Date('2022-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-01-01T12:00:00Z'),
        rawData: {
          opportunityid: '12345',
          name: 'Opportunity A',
          description: null,
          statuscode: 1,
          actualvalue: 10000,
          actualclosedate: null,
          stepname: 'Initial',
          overriddencreatedon: null,
          createdon: '2022-01-01T12:00:00Z',
          modifiedon: '2023-01-01T12:00:00Z',
          _ownerid_value: 'abcdef',
          _parentaccountid_value: '56789',
        },
      };

      const result = fromDynamicsOpportunityToRemoteOpportunity(
        mockDynamicsOpportunity,
        mockInheritedFieldMappingConfig
      );

      expect(result).toEqual(expectedOpportunity);
    });

    test('converts dynamics opportunity with all fields set', () => {
      const mockDynamicsOpportunity: DynamicsOpportunity = {
        opportunityid: '12345',
        name: 'Opportunity B',
        description: 'Test description',
        statuscode: 3,
        actualvalue: 5000,
        actualclosedate: '2023-03-01T12:00:00Z',
        stepname: 'Completed',
        overriddencreatedon: '2021-12-31T12:00:00Z',
        createdon: '2022-01-01T12:00:00Z',
        modifiedon: '2023-01-01T12:00:00Z',
        _ownerid_value: 'abcdef',
        _parentaccountid_value: '56789',
        stageid_processstage: { stagename: 'Final Stage' },
        'stageid_processstage@odata.nextLink': 'link1',
        opportunity_leadtoopportunitysalesprocess: { name: 'Pipeline A' },
        'opportunity_leadtoopportunitysalesprocess@odata.nextLink': 'link2',
      };

      const expectedOpportunity: Opportunity = {
        id: '12345',
        name: 'Opportunity B',
        description: 'Test description',
        ownerId: 'abcdef',
        lastActivityAt: null,
        status: 'WON',
        pipeline: 'Pipeline A',
        accountId: '56789',
        amount: 5000,
        closeDate: new Date('2023-03-01T12:00:00Z'),
        stage: 'Final Stage',
        createdAt: new Date('2021-12-31T12:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-01-01T12:00:00Z'),
        rawData: {
          opportunityid: '12345',
          name: 'Opportunity B',
          description: 'Test description',
          statuscode: 3,
          actualvalue: 5000,
          actualclosedate: '2023-03-01T12:00:00Z',
          stepname: 'Completed',
          overriddencreatedon: '2021-12-31T12:00:00Z',
          createdon: '2022-01-01T12:00:00Z',
          modifiedon: '2023-01-01T12:00:00Z',
          _ownerid_value: 'abcdef',
          _parentaccountid_value: '56789',
        },
      };

      const result = fromDynamicsOpportunityToRemoteOpportunity(
        mockDynamicsOpportunity,
        mockInheritedFieldMappingConfig
      );

      expect(result).toEqual(expectedOpportunity);
    });
  });
  describe('fromDynamicsLeadToRemoteLead', () => {
    test('should convert DynamicsLead to RemoteLead', () => {
      const mockDynamicsLead: DynamicsLead = {
        leadid: '123',
        firstname: 'John',
        lastname: 'Doe',
        jobtitle: 'Engineer',
        companyname: 'Tech Corp',
        description: 'Lead Description',
        address1_line1: '123 Main St',
        address1_line2: 'Apt 4B',
        address1_city: 'Metropolis',
        address1_stateorprovince: 'NY',
        address1_postalcode: '10001',
        address1_country: 'US',
        address1_addresstypecode: 1,
        address2_line1: '456 Secondary St',
        address2_line2: 'Suite 5A',
        address2_city: 'Uptown',
        address2_stateorprovince: 'NY',
        address2_postalcode: '10002',
        address2_country: 'US',
        address2_addresstypecode: 2,
        emailaddress1: 'john.doe@example.com',
        emailaddress2: 'j.doe@work.com',
        emailaddress3: null,
        telephone1: '123-456-7890',
        telephone2: '234-567-8901',
        telephone3: null,
        websiteurl: 'https://www.johndoe.com',
        _ownerid_value: 'owner-1',
        industrycode: 1001,
        numberofemployees: 100,
        createdon: '2023-08-18T12:00:00Z',
        overriddencreatedon: null,
        modifiedon: '2023-08-19T12:00:00Z',
        leadsourcecode: 2001,
        _accountid_value: 'account-1',
        _contactid_value: 'contact-1',
      };

      const result = fromDynamicsLeadToRemoteLead(mockDynamicsLead, mockInheritedFieldMappingConfig);

      const expectedLead: Lead = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        title: 'Engineer',
        ownerId: 'owner-1',
        company: 'Tech Corp',
        convertedDate: null,
        leadSource: null,
        convertedAccountId: 'account-1',
        convertedContactId: 'contact-1',
        addresses: [
          {
            street1: '123 Main St',
            street2: 'Apt 4B',
            city: 'Metropolis',
            state: 'NY',
            postalCode: '10001',
            country: 'US',
            addressType: 'billing',
          },
          {
            street1: '456 Secondary St',
            street2: 'Suite 5A',
            city: 'Uptown',
            state: 'NY',
            postalCode: '10002',
            country: 'US',
            addressType: 'shipping',
          },
        ],
        emailAddresses: [
          {
            emailAddress: 'john.doe@example.com',
            emailAddressType: 'primary',
          },
          {
            emailAddress: 'j.doe@work.com',
            emailAddressType: 'other',
          },
        ],
        phoneNumbers: [
          {
            phoneNumber: '123-456-7890',
            phoneNumberType: 'primary',
          },
          {
            phoneNumber: '234-567-8901',
            phoneNumberType: 'other',
          },
        ],
        createdAt: new Date('2023-08-18T12:00:00Z'),
        updatedAt: new Date('2023-08-19T12:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-08-19T12:00:00Z'),
        rawData: mockDynamicsLead,
      };

      expect(result).toEqual(expectedLead);
    });
  });
  describe('fromDynamicsUserToRemoteUser', () => {
    test('should correctly convert a DynamicsUser to a Remote User', () => {
      const mockDynamicsUser: DynamicsUser = {
        systemuserid: 'user123',
        fullname: 'John Doe',
        internalemailaddress: 'john.doe@example.com',
        deletedstate: null,
        createdon: '2023-08-18T12:00:00Z',
        overriddencreatedon: null,
        modifiedon: '2023-08-19T12:00:00Z',
        isdisabled: false,
      };

      const result = fromDynamicsUserToRemoteUser(mockDynamicsUser, mockInheritedFieldMappingConfig);

      const expectedUser: User = {
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        isDeleted: false,
        isActive: true,
        createdAt: new Date('2023-08-18T12:00:00Z'),
        updatedAt: new Date('2023-08-19T12:00:00Z'),
        lastModifiedAt: new Date('2023-08-19T12:00:00Z'),
        rawData: mockDynamicsUser,
      };

      expect(result).toEqual(expectedUser);
    });
  });
  describe('toDynamicsAddresses', () => {
    test('should convert an array of addresses to Dynamics format', () => {
      const addresses: Address[] = [
        {
          street1: 'Street 2-1',
          street2: null,
          city: 'City 2',
          state: 'State 2',
          postalCode: '123456',
          country: 'Country 2',
          addressType: 'shipping',
        },
        {
          street1: 'Street 1-1',
          street2: null,
          city: 'City 1',
          state: 'State 1',
          postalCode: '654321',
          country: 'Country 1',
          addressType: 'primary',
        },
      ];

      const result = toDynamicsAddresses(addresses, 2);
      const expected = {
        address1_line1: 'Street 1-1',
        address1_line2: null,
        address1_city: 'City 1',
        address1_stateorprovince: 'State 1',
        address1_postalcode: '654321',
        address1_country: 'Country 1',
        address1_addresstypecode: '3',
        address2_line1: 'Street 2-1',
        address2_line2: null,
        address2_city: 'City 2',
        address2_stateorprovince: 'State 2',
        address2_postalcode: '123456',
        address2_country: 'Country 2',
        address2_addresstypecode: '2',
      };

      expect(result).toEqual(expected);
    });

    test('should throw an error if count is not 2 or 3', () => {
      const addresses: Address[] = [
        {
          street1: 'Street 1',
          street2: null,
          city: 'City',
          state: 'State',
          postalCode: '654321',
          country: 'Country',
          addressType: 'primary',
        },
      ];

      expect(() => toDynamicsAddresses(addresses, 1)).toThrowError(
        'Dynamics only supports 2 or 3 addresses, depending on type'
      );
    });
  });

  describe('toDynamicsEmailAddresses', () => {
    test('should convert an array of email addresses to Dynamics format', () => {
      const emailAddresses: EmailAddress[] = [
        { emailAddress: 'test2@example.com', emailAddressType: 'work' },
        { emailAddress: 'test1@example.com', emailAddressType: 'primary' },
      ];

      const result = toDynamicsEmailAddresses(emailAddresses);
      const expected = {
        emailaddress1: 'test1@example.com',
        emailaddress2: 'test2@example.com',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('toDynamicsPhoneNumbers', () => {
    test('should convert an array of phone numbers to Dynamics format', () => {
      const phoneNumbers: PhoneNumber[] = [
        { phoneNumber: '123-456-7891', phoneNumberType: 'other' },
        { phoneNumber: '321-654-0987', phoneNumberType: 'primary' },
      ];

      const result = toDynamicsPhoneNumbers(phoneNumbers);
      const expected = {
        telephone1: '321-654-0987',
        telephone2: '123-456-7891',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('toDynamicsContactCreateParams', () => {
    test('should convert contact creation parameters to Dynamics format', () => {
      const contact: ContactCreateParams = {
        firstName: 'John',
        lastName: 'Doe',
        accountId: '12345',
        ownerId: '54321',
        addresses: [
          {
            street1: '123 Main St',
            street2: 'Apt 4B',
            city: 'Anytown',
            state: 'NY',
            postalCode: '12345',
            country: 'USA',
            addressType: 'primary',
          },
        ],
        emailAddresses: [{ emailAddress: 'johndoe@example.com', emailAddressType: 'primary' }],
        phoneNumbers: [{ phoneNumber: '555-555-5555', phoneNumberType: 'primary' }],
        customFields: {
          someField: 'someValue',
        },
      };

      const result = toDynamicsContactCreateParams(contact);
      const expected = {
        firstname: 'John',
        lastname: 'Doe',
        'parentcustomerid@odata.bind': `/accounts(12345)`,
        'ownerid@odata.bind': `/systemusers(54321)`,
        ...toDynamicsAddresses(contact.addresses, 3),
        ...toDynamicsEmailAddresses(contact.emailAddresses),
        ...toDynamicsPhoneNumbers(contact.phoneNumbers),
        someField: 'someValue',
      };

      expect(result).toEqual(expected);
    });

    test('should handle missing optional fields correctly', () => {
      const contact: ContactCreateParams = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const result = toDynamicsContactCreateParams(contact);
      const expected = {
        firstname: 'Jane',
        lastname: 'Smith',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('toDynamicsOpportunityCreateParams', () => {
    test('should convert complete opportunity creation parameters to Dynamics format', () => {
      const opportunity: OpportunityCreateParams = {
        name: 'New Deal',
        description: 'A potential deal',
        amount: 5000,
        stage: 'Proposal',
        status: 'OPEN',
        closeDate: new Date('2023-08-17'),
        accountId: '12345',
        ownerId: '54321',
        customFields: {
          someField: 'someValue',
        },
      };

      const result = toDynamicsOpportunityCreateParams(opportunity);
      const expected = {
        name: 'New Deal',
        description: 'A potential deal',
        actualvalue: 5000,
        stepname: 'Proposal',
        actualclosedate: '2023-08-17',
        'parentaccountid@odata.bind': `/accounts(12345)`,
        'ownerid@odata.bind': `/systemusers(54321)`,
        statuscode: 1,
        someField: 'someValue',
      };

      expect(result).toEqual(expected);
    });

    test('should handle missing optional fields correctly', () => {
      const opportunity: OpportunityCreateParams = {
        name: 'Incomplete Deal',
      };

      const result = toDynamicsOpportunityCreateParams(opportunity);
      const expected = {
        name: 'Incomplete Deal',
      };

      expect(result).toEqual(expected);
    });

    test('should map opportunity statuses correctly', () => {
      const statuses: Record<OpportunityStatus, number | undefined> = {
        OPEN: 1,
        WON: 3,
        LOST: 5,
      };

      for (const status in statuses) {
        const opportunity: OpportunityCreateParams = {
          name: `Deal with status ${status}`,
          status: status as OpportunityStatus,
        };

        const result = toDynamicsOpportunityCreateParams(opportunity);
        expect(result.statuscode).toEqual(statuses[status as OpportunityStatus]);
      }
    });
  });
  describe('toDynamicsLeadCreateParams', () => {
    test('should convert complete lead creation parameters to Dynamics format', () => {
      const lead: LeadCreateParams = {
        firstName: 'John',
        lastName: 'Doe',
        title: 'Developer',
        company: 'TechCo',
        leadSource: 'Web',
        addresses: [
          // Include your address mocks here
        ],
        emailAddresses: [
          // Include your email address mocks here
        ],
        phoneNumbers: [
          // Include your phone number mocks here
        ],
        ownerId: '98765',
        customFields: {
          someField: 'someValue',
        },
      };

      const result = toDynamicsLeadCreateParams(lead);
      const expected = {
        firstname: 'John',
        lastname: 'Doe',
        jobtitle: 'Developer',
        companyname: 'TechCo',
        // The result from toDynamicsAddresses, toDynamicsEmailAddresses and toDynamicsPhoneNumbers should be here too.
        'ownerid@odata.bind': `/systemusers(98765)`,
        leadsourcecode: 8, // For 'Web'
        someField: 'someValue',
      };

      expect(result).toEqual(expected);
    });

    test('should handle missing optional fields correctly', () => {
      const lead: LeadCreateParams = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const result = toDynamicsLeadCreateParams(lead);
      const expected = {
        firstname: 'Jane',
        lastname: 'Smith',
        leadsourcecode: 10, // For 'Other'
      };

      expect(result).toEqual(expected);
    });

    test('should map known lead sources correctly', () => {
      const leadSources = [
        'Advertisement',
        'Employee Referral',
        'External Referral',
        'Partner',
        'Public Relations',
        'Seminar',
        'Trade Show',
        'Web',
        'Word of Mouth',
      ];

      leadSources.forEach((source) => {
        const lead: LeadCreateParams = {
          firstName: `Lead from ${source}`,
          leadSource: source,
        };

        const result = toDynamicsLeadCreateParams(lead);
        expect(result.leadsourcecode).not.toEqual(10); // Should not be 'Other'
      });
    });

    test('should use the code for "Other" for unknown lead sources', () => {
      const lead: LeadCreateParams = {
        firstName: 'Unknown Source Lead',
        leadSource: 'Some Unknown Source',
      };

      const result = toDynamicsLeadCreateParams(lead);
      expect(result.leadsourcecode).toEqual(10); // For 'Other'
    });
  });

  describe('toDynamicsAccountCreateParams', () => {
    test('converts complete account creation parameters to Dynamics format', () => {
      const account: AccountCreateParams = {
        name: 'TechCo',
        description: 'A tech company',
        industry: 'Financial',
        website: 'https://techco.com',
        numberOfEmployees: 100,
        ownerId: '12345',
        customFields: {
          someField: 'someValue',
        },
      };

      const result = toDynamicsAccountCreateParams(account);
      const expected = {
        name: 'TechCo',
        description: 'A tech company',
        industrycode: industryNameToCode['Financial'],
        websiteurl: 'https://techco.com',
        'ownerid@odata.bind': `/systemusers(12345)`,
        numberofemployees: 100,
        someField: 'someValue',
      };

      expect(result).toEqual(expected);
    });

    test('handles missing optional fields correctly', () => {
      const account: AccountCreateParams = {
        name: 'TechCo',
      };

      const result = toDynamicsAccountCreateParams(account);
      const expected = {
        name: 'TechCo',
      };

      expect(result).toEqual(expected);
    });

    test('maps known industries correctly', () => {
      const industries = Object.keys(industryNameToCode);

      industries.forEach((industry) => {
        const account: AccountCreateParams = {
          name: `Company from ${industry}`,
          industry: industry,
        };

        const result = toDynamicsAccountCreateParams(account);
        expect(result.industrycode).toEqual(industryNameToCode[industry]);
      });
    });

    test('handles unknown industries correctly', () => {
      const account: AccountCreateParams = {
        name: 'Unknown Industry Co.',
        industry: 'Some Unknown Industry',
      };

      const result = toDynamicsAccountCreateParams(account);
      expect(result.industrycode).toBeUndefined();
    });
  });
});
