/**
 * Tests Pipedrive mappers
 *
 * @group unit/mappers/pipedrive
 */

import { describe, expect, test } from '@jest/globals';
import type { PipedriveRecord } from '.';
import { CRM_MOBILE_PHONE, CRM_PRIMARY_EMAIL, PIPEDRIVE_PIPELINE_STAGE_MAPPING } from '../../utils/test_data';
import {
  fromPipedriveDealToOpportunity,
  fromPipedriveEmailsToEmailAddresses,
  fromPipedriveLeadToLead,
  fromPipedriveOrganizationToAccount,
  fromPipedriveOrganizationToAddresses,
  fromPipedrivePersonToContact,
  fromPipedrivePhonesToPhoneNumbers,
  fromPipedriveUserToUser,
  getPipelineId,
  getStageId,
  mapCustomFieldsFromNamesToKeys,
  rewriteCustomFieldsInRecord,
  toPipedriveDealCreateParams,
  toPipedriveLeadCreateParams,
  toPipedriveLeadUpdateParams,
  toPipedriveOrganizationCreateParams,
  toPipedrivePersonCreateParams,
  toPipedrivePersonUpdateParams,
} from './mappers';
import type { PipedriveObjectField } from './types';
describe('Pipedrive mappers', () => {
  describe('mapCustomFieldsFromNamesToKeys', () => {
    test('should map custom fields from names to keys', () => {
      const customFields = {
        'Field Name': 'Value',
        'Another Field': 'Another Value',
      };

      const fields: PipedriveObjectField[] = [
        {
          key: '123',
          name: 'Field Name',
          edit_flag: true,
          field_type: 'text',
        },
        {
          key: '456',
          name: 'Another Field',
          edit_flag: true,
          field_type: 'text',
        },
      ];

      const result = mapCustomFieldsFromNamesToKeys(customFields, fields);
      expect(result).toEqual({
        '123': 'Value',
        '456': 'Another Value',
      });
    });

    test('should map enum and set fields correctly', () => {
      const customFields = {
        'Enum Field': 'Option1',
        'Set Field': 'OptionB',
      };

      const fields: PipedriveObjectField[] = [
        {
          key: '789',
          name: 'Enum Field',
          edit_flag: true,
          field_type: 'enum',
          options: [
            { id: 1, label: 'Option1' },
            { id: 2, label: 'Option2' },
          ],
        },
        {
          key: '012',
          name: 'Set Field',
          edit_flag: true,
          field_type: 'set',
          options: [
            { id: 3, label: 'OptionA' },
            { id: 4, label: 'OptionB' },
          ],
        },
      ];

      const result = mapCustomFieldsFromNamesToKeys(customFields, fields);
      expect(result).toEqual({
        '789': 1,
        '012': 4,
      });
    });

    test('should throw BadRequestError if field name is not found', () => {
      const customFields = {
        'NonExistent Field': 'Value',
      };

      const fields: PipedriveObjectField[] = [];

      expect(() => {
        mapCustomFieldsFromNamesToKeys(customFields, fields);
      }).toThrowError('Field not found: NonExistent Field');
    });

    test('should throw BadRequestError if option for enum/set field is not found', () => {
      const customFields = {
        'Enum Field': 'NonExistentOption',
      };

      const fields: PipedriveObjectField[] = [
        {
          key: '789',
          name: 'Enum Field',
          edit_flag: true,
          field_type: 'enum',
          options: [
            { id: 1, label: 'Option1' },
            { id: 2, label: 'Option2' },
          ],
        },
      ];

      expect(() => {
        mapCustomFieldsFromNamesToKeys(customFields, fields);
      }).toThrowError('Option NonExistentOption not found for field Enum Field');
    });
  });

  describe('rewriteCustomFieldsInRecord', () => {
    test('should rewrite custom fields in the record based on the fields provided', () => {
      const record = {
        '123': 'Value',
        '456': 'Another Value',
        otherKey: 'OtherValue',
      };

      const fields: PipedriveObjectField[] = [
        {
          key: '123',
          name: 'Field Name',
          edit_flag: true,
          field_type: 'text',
        },
        {
          key: '456',
          name: 'Another Field',
          edit_flag: true,
          field_type: 'text',
        },
      ];

      const result = rewriteCustomFieldsInRecord(record, fields);
      expect(result).toEqual({
        'Field Name': 'Value',
        'Another Field': 'Another Value',
        otherKey: 'OtherValue',
      });
    });

    test('should rewrite enum and set fields correctly', () => {
      const record = {
        '789': '1',
        '012': '4',
      };

      const fields: PipedriveObjectField[] = [
        {
          key: '789',
          name: 'Enum Field',
          edit_flag: true,
          field_type: 'enum',
          options: [
            { id: 1, label: 'Option1' },
            { id: 2, label: 'Option2' },
          ],
        },
        {
          key: '012',
          name: 'Set Field',
          edit_flag: true,
          field_type: 'set',
          options: [
            { id: 3, label: 'OptionA' },
            { id: 4, label: 'OptionB' },
          ],
        },
      ];

      const result = rewriteCustomFieldsInRecord(record, fields);
      expect(result).toEqual({
        'Enum Field': 'Option1',
        'Set Field': 'OptionB',
      });
    });

    test('should maintain the value for unmatched enum/set option IDs', () => {
      const record = {
        '789': '3', // This ID doesn't match any option in the field definition
      };

      const fields: PipedriveObjectField[] = [
        {
          key: '789',
          name: 'Enum Field',
          edit_flag: true,
          field_type: 'enum',
          options: [
            { id: 1, label: 'Option1' },
            { id: 2, label: 'Option2' },
          ],
        },
      ];

      const result = rewriteCustomFieldsInRecord(record, fields);
      expect(result).toEqual({
        'Enum Field': '3', // Maintains the original value since it's unmatched
      });
    });
  });
  describe('Pipedrive helper functions', () => {
    describe('fromPipedriveEmailsToEmailAddresses', () => {
      test('should transform emails with work or primary labels', () => {
        const emails = [
          { label: 'work', value: 'work@example.com' },
          { label: 'primary', value: 'primary@example.com' },
          { label: 'other', value: 'other@example.com' },
        ];

        const result = fromPipedriveEmailsToEmailAddresses(emails);

        expect(result).toEqual([
          { emailAddress: 'work@example.com', emailAddressType: 'work' },
          { emailAddress: 'primary@example.com', emailAddressType: 'primary' },
        ]);
      });
    });

    describe('fromPipedrivePhonesToPhoneNumbers', () => {
      test('should transform phone numbers with mobile, primary or fax labels', () => {
        const phoneNumbers = [
          { label: 'mobile', value: '+1234567890' },
          { label: 'primary', value: '+0987654321' },
          { label: 'home', value: '+1122334455' },
        ];

        const result = fromPipedrivePhonesToPhoneNumbers(phoneNumbers);

        expect(result).toEqual([
          { phoneNumber: '+1234567890', phoneNumberType: 'mobile' },
          { phoneNumber: '+0987654321', phoneNumberType: 'primary' },
        ]);
      });
    });

    describe('fromPipedriveOrganizationToAddresses', () => {
      test('should transform Pipedrive organization to address', () => {
        const organization = {
          address_street_number: '123',
          address_route: 'Main St',
          address_subpremise: 'Apt 4B',
          address_locality: 'Cityville',
          address_admin_area_level_1: 'State',
          address_postal_code: '12345',
          address_country: 'Countryland',
        };

        const result = fromPipedriveOrganizationToAddresses(organization);

        expect(result).toEqual([
          {
            street1: '123 Main St',
            street2: 'Apt 4B',
            city: 'Cityville',
            state: 'State',
            postalCode: '12345',
            country: 'Countryland',
            addressType: 'primary',
          },
        ]);
      });

      test('should return empty array if all address fields are missing', () => {
        const organization = {};

        const result = fromPipedriveOrganizationToAddresses(organization);

        expect(result).toEqual([]);
      });
    });
  });
  describe('fromPipedrivePersonToContact', () => {
    test('should transform a basic Pipedrive person to a Contact', () => {
      const person: PipedriveRecord = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: [{ label: 'work', value: 'johndoe@example.com' }],
        phone: [{ label: 'mobile', value: '+1234567890' }],
        last_activity_date: '2023-08-17',
        owner_id: { id: 2 },
        org_id: { value: 3 },
        add_time: '2023-01-01T00:00:00Z',
        update_time: '2023-01-02T00:00:00Z',
      };

      const result = fromPipedrivePersonToContact(person, []);

      expect(result).toEqual({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        addresses: [],
        emailAddresses: [{ emailAddress: 'johndoe@example.com', emailAddressType: 'work' }],
        phoneNumbers: [{ phoneNumber: '+1234567890', phoneNumberType: 'mobile' }],
        lifecycleStage: null,
        lastActivityAt: new Date('2023-08-17'),
        ownerId: '2',
        accountId: '3',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-01-02T00:00:00Z'),
        rawData: person,
      });
    });

    test('should handle person records with missing optional fields', () => {
      const person: PipedriveRecord = {
        id: 1,
        first_name: 'Jane',
        email: [],
        phone: [],
      };

      const result = fromPipedrivePersonToContact(person, []);

      expect(result).toEqual({
        id: '1',
        firstName: 'Jane',
        lastName: null,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
        lifecycleStage: null,
        lastActivityAt: null,
        ownerId: null,
        accountId: null,
        createdAt: null,
        updatedAt: null,
        isDeleted: false,
        lastModifiedAt: new Date(0),
        rawData: person,
      });
    });
  });
  test('should transform a Pipedrive person with custom fields to a Contact', () => {
    const mockFields: PipedriveObjectField[] = [
      {
        key: 'custom_key1',
        name: 'Custom Field 1',
        field_type: 'text',
        edit_flag: true,
      },
      {
        key: 'custom_key2',
        name: 'Custom Field 2',
        field_type: 'enum',
        edit_flag: true,
        options: [
          { id: 1, label: 'Option A' },
          { id: 2, label: 'Option B' },
        ],
      },
    ];

    const person: PipedriveRecord = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: [{ label: 'work', value: 'johndoe@example.com' }],
      phone: [{ label: 'mobile', value: '+1234567890' }],
      last_activity_date: '2023-08-17',
      owner_id: { id: 2 },
      org_id: { value: 3 },
      add_time: '2023-01-01T00:00:00Z',
      update_time: '2023-01-02T00:00:00Z',
      custom_key1: 'Some value',
      custom_key2: '1',
    };

    const result = fromPipedrivePersonToContact(person, mockFields);

    expect(result).toEqual({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      addresses: [],
      emailAddresses: [{ emailAddress: 'johndoe@example.com', emailAddressType: 'work' }],
      phoneNumbers: [{ phoneNumber: '+1234567890', phoneNumberType: 'mobile' }],
      lifecycleStage: null,
      lastActivityAt: new Date('2023-08-17'),
      ownerId: '2',
      accountId: '3',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
      isDeleted: false,
      lastModifiedAt: new Date('2023-01-02T00:00:00Z'),
      rawData: {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: [{ label: 'work', value: 'johndoe@example.com' }],
        phone: [{ label: 'mobile', value: '+1234567890' }],
        last_activity_date: '2023-08-17',
        owner_id: { id: 2 },
        org_id: { value: 3 },
        add_time: '2023-01-01T00:00:00Z',
        update_time: '2023-01-02T00:00:00Z',
        'Custom Field 1': 'Some value',
        'Custom Field 2': 'Option A',
      },
    });
  });
  describe('fromPipedriveLeadToLead', () => {
    const mockFields: PipedriveObjectField[] = [
      {
        key: 'custom_key1',
        name: 'Custom Field 1',
        field_type: 'text',
        edit_flag: true,
      },
      {
        key: 'custom_key2',
        name: 'Custom Field 2',
        field_type: 'enum',
        edit_flag: true,
        options: [
          { id: 1, label: 'Option A' },
          { id: 2, label: 'Option B' },
        ],
      },
    ];

    test('should transform a Pipedrive lead with custom fields to a Lead', () => {
      const lead: PipedriveRecord = {
        id: 1,
        source_name: 'Website',
        title: 'Web Lead',
        owner_id: 2,
        organization_id: 3,
        person_id: 4,
        add_time: '2023-01-01T00:00:00Z',
        update_time: '2023-01-02T00:00:00Z',
        is_archived: false,
        custom_key1: 'Some value',
        custom_key2: '1',
      };

      const result = fromPipedriveLeadToLead(lead, mockFields);

      expect(result).toEqual({
        id: '1',
        leadSource: 'Website',
        title: 'Web Lead',
        company: null,
        firstName: null,
        lastName: null,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
        ownerId: '2',
        convertedAccountId: '3',
        convertedContactId: '4',
        convertedDate: null,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-01-02T00:00:00Z'),
        rawData: {
          id: 1,
          source_name: 'Website',
          title: 'Web Lead',
          owner_id: 2,
          organization_id: 3,
          person_id: 4,
          add_time: '2023-01-01T00:00:00Z',
          update_time: '2023-01-02T00:00:00Z',
          is_archived: false,
          'Custom Field 1': 'Some value',
          'Custom Field 2': 'Option A',
        },
      });
    });
  });
  describe('fromPipedriveDealToOpportunity', () => {
    const mockFields: PipedriveObjectField[] = [
      {
        key: 'custom_key1',
        name: 'Custom Field 1',
        field_type: 'text',
        edit_flag: true,
      },
    ];

    test('should transform a Pipedrive deal in the Sales pipeline to an Opportunity', () => {
      const deal: PipedriveRecord = {
        id: 1,
        title: 'Deal 1',
        user_id: { id: 2 },
        org_id: { value: 3 },
        pipeline_id: 0,
        stage_id: 0,
        add_time: '2023-01-01T00:00:00Z',
        update_time: '2023-01-02T00:00:00Z',
        status: 'won',
        custom_key1: 'Value for custom field',
        last_activity_date: '2023-01-01T10:00:00Z',
        close_time: '2023-01-10T00:00:00Z',
        value: 10000,
      };

      const result = fromPipedriveDealToOpportunity(deal, PIPEDRIVE_PIPELINE_STAGE_MAPPING, mockFields);

      expect(result).toEqual({
        id: '1',
        name: 'Deal 1',
        description: null,
        amount: 10000,
        stage: 'Appointment Scheduled',
        status: 'WON',
        lastActivityAt: new Date('2023-01-01T10:00:00Z'),
        closeDate: new Date('2023-01-10T00:00:00Z'),
        pipeline: 'Sales Pipeline',
        ownerId: '2',
        accountId: '3',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-01-02T00:00:00Z'),
        rawData: {
          id: 1,
          title: 'Deal 1',
          user_id: { id: 2 },
          org_id: { value: 3 },
          pipeline_id: 0,
          stage_id: 0,
          add_time: '2023-01-01T00:00:00Z',
          update_time: '2023-01-02T00:00:00Z',
          status: 'won',
          'Custom Field 1': 'Value for custom field',
          last_activity_date: '2023-01-01T10:00:00Z',
          close_time: '2023-01-10T00:00:00Z',
          value: 10000,
        },
      });
    });
  });
  describe('fromPipedriveOrganizationToAccount', () => {
    const mockFields: PipedriveObjectField[] = [
      {
        key: 'custom_key1',
        name: 'Custom Field 1',
        field_type: 'text',
        edit_flag: true,
      },
    ];

    test('should transform a Pipedrive organization to an Account', () => {
      const organization: PipedriveRecord = {
        id: 1,
        name: 'Organization 1',
        owner_id: { id: 2 },
        add_time: '2023-01-01T00:00:00Z',
        update_time: '2023-01-02T00:00:00Z',
        people_count: 50,
        custom_key1: 'Value for custom field',
        address_street_number: '123',
        address_route: 'Main Street',
        address_locality: 'Cityville',
        address_admin_area_level_1: 'State',
        address_postal_code: '12345',
        address_country: 'Countryland',
      };

      const result = fromPipedriveOrganizationToAccount(organization, mockFields);

      expect(result).toEqual({
        id: '1',
        name: 'Organization 1',
        description: null,
        industry: null,
        website: null,
        numberOfEmployees: 50,
        addresses: fromPipedriveOrganizationToAddresses(organization),
        phoneNumbers: [],
        lastActivityAt: null,
        lifecycleStage: null,
        ownerId: '2',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-01-02T00:00:00Z'),
        rawData: {
          id: 1,
          name: 'Organization 1',
          owner_id: { id: 2 },
          add_time: '2023-01-01T00:00:00Z',
          update_time: '2023-01-02T00:00:00Z',
          people_count: 50,
          address_street_number: '123',
          address_route: 'Main Street',
          address_locality: 'Cityville',
          address_admin_area_level_1: 'State',
          address_postal_code: '12345',
          address_country: 'Countryland',
          'Custom Field 1': 'Value for custom field',
        },
      });
    });
  });
  describe('fromPipedriveUserToUser', () => {
    test('should transform a Pipedrive user to a User with all fields', () => {
      const pipedriveUser: PipedriveRecord = {
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
        active_flag: true,
        created: '2023-01-01T00:00:00Z',
        modified: '2023-01-02T00:00:00Z',
      };

      const result = fromPipedriveUserToUser(pipedriveUser);

      expect(result).toEqual({
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        isActive: true,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-01-02T00:00:00Z'),
        rawData: pipedriveUser,
      });
    });

    test('should handle optional fields correctly', () => {
      const pipedriveUser: PipedriveRecord = {
        id: 2,
        name: null,
        email: null,
        active_flag: false,
        created: null,
        modified: null,
      };

      const result = fromPipedriveUserToUser(pipedriveUser);

      expect(result).toEqual({
        id: '2',
        name: null,
        email: null,
        isActive: false,
        createdAt: null,
        updatedAt: null,
        isDeleted: false,
        lastModifiedAt: new Date(0),
        rawData: pipedriveUser,
      });
    });
  });
  describe('toPipedriveLeadCreateParams', () => {
    test('should throw an error if neither convertedAccountId nor convertedContactId is provided', () => {
      const leadCreateParams = {
        title: 'New Lead',
      };

      expect(() => {
        toPipedriveLeadCreateParams(leadCreateParams, []);
      }).toThrow('Either converted_account_id or converted_contact_id must be provided');
    });

    test('should transform LeadCreateParams to Pipedrive lead params', () => {
      const leadCreateParams = {
        title: 'New Lead',
        convertedAccountId: '100',
        ownerId: '200',
        customFields: {
          'Field Name': 'Field Value',
        },
      };

      const pipedriveObjectFields: PipedriveObjectField[] = [
        {
          key: 'field_key',
          name: 'Field Name',
          edit_flag: true,
          field_type: 'text',
          // Add other properties if necessary
        },
      ];

      const result = toPipedriveLeadCreateParams(leadCreateParams, pipedriveObjectFields);

      expect(result).toEqual({
        title: 'New Lead',
        owner_id: 200,
        organization_id: 100,
        field_key: 'Field Value',
      });
    });
  });

  describe('toPipedriveLeadUpdateParams', () => {
    test('should transform LeadCreateParams to Pipedrive lead update params', () => {
      const leadCreateParams = {
        title: 'Updated Lead',
        convertedContactId: '300',
        ownerId: '200',
        customFields: {
          'Field Name': 'Updated Value',
        },
      };

      const pipedriveObjectFields: PipedriveObjectField[] = [
        {
          key: 'field_key',
          name: 'Field Name',
          edit_flag: true,
          field_type: 'text',
          // Add other properties if necessary
        },
      ];

      const result = toPipedriveLeadUpdateParams(leadCreateParams, pipedriveObjectFields);

      expect(result).toEqual({
        title: 'Updated Lead',
        owner_id: 200,
        person_id: 300,
        field_key: 'Updated Value',
      });
    });
  });
  describe('toPipedrivePersonCreateParams', () => {
    test('should throw an error if neither firstName nor lastName is provided', () => {
      const contactCreateParams = {
        firstName: null,
        lastName: null,
      };

      expect(() => {
        toPipedrivePersonCreateParams(contactCreateParams, []);
      }).toThrow('Either firstName or lastName must be provided');
    });

    test('should transform ContactCreateParams to Pipedrive person creation params', () => {
      const contactCreateParams = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [CRM_PRIMARY_EMAIL],
        phoneNumbers: [CRM_MOBILE_PHONE],
        accountId: '100',
        ownerId: '200',
        customFields: {
          'Custom Field': 'Custom Value',
        },
      };

      const pipedriveObjectFields: PipedriveObjectField[] = [
        {
          key: 'custom_field_key',
          name: 'Custom Field',
          edit_flag: true,
          field_type: 'text',
        },
      ];

      const result = toPipedrivePersonCreateParams(contactCreateParams, pipedriveObjectFields);

      expect(result).toEqual({
        name: 'John Doe',
        email: [{ label: 'primary', value: 'primary@address.com' }],
        phone: [{ label: 'mobile', value: '1234567890' }],
        org_id: 100,
        owner_id: 200,
        custom_field_key: 'Custom Value',
      });
    });
  });

  describe('toPipedrivePersonUpdateParams', () => {
    test('should transform ContactCreateParams to Pipedrive person update params', () => {
      const contactCreateParams = {
        firstName: 'Jane',
        lastName: 'Smith',
        emailAddresses: [CRM_PRIMARY_EMAIL],
        phoneNumbers: [CRM_MOBILE_PHONE],
        accountId: '101',
        ownerId: '201',
        customFields: {
          'Custom Field': 'Updated Value',
        },
      };

      const pipedriveObjectFields: PipedriveObjectField[] = [
        {
          key: 'custom_field_key',
          name: 'Custom Field',
          edit_flag: true,
          field_type: 'text',
        },
      ];

      const result = toPipedrivePersonUpdateParams(contactCreateParams, pipedriveObjectFields);

      expect(result).toEqual({
        name: 'Jane Smith',
        email: [{ label: 'primary', value: 'primary@address.com' }],
        phone: [{ label: 'mobile', value: '1234567890' }],
        org_id: 101,
        owner_id: 201,
        custom_field_key: 'Updated Value',
      });
    });
  });
  describe('toPipedriveOrganizationCreateParams', () => {
    test('should transform AccountCreateParams to Pipedrive organization creation params', () => {
      const accountCreateParams = {
        name: 'Tech Corp',
        ownerId: '300',
        customFields: {
          'Custom Field 1': 'Custom Value 1',
          'Custom Field 2': 'Custom Value 2',
        },
      };

      const pipedriveObjectFields: PipedriveObjectField[] = [
        {
          key: 'custom_field_key_1',
          name: 'Custom Field 1',
          edit_flag: true,
          field_type: 'text',
        },
        {
          key: 'custom_field_key_2',
          name: 'Custom Field 2',
          edit_flag: true,
          field_type: 'text',
        },
      ];

      const result = toPipedriveOrganizationCreateParams(accountCreateParams, pipedriveObjectFields);

      expect(result).toEqual({
        name: 'Tech Corp',
        owner_id: '300',
        custom_field_key_1: 'Custom Value 1',
        custom_field_key_2: 'Custom Value 2',
      });
    });

    test('should handle AccountCreateParams without custom fields', () => {
      const accountCreateParams = {
        name: 'Tech Corp',
        ownerId: '300',
      };

      const pipedriveObjectFields: PipedriveObjectField[] = [];

      const result = toPipedriveOrganizationCreateParams(accountCreateParams, pipedriveObjectFields);

      expect(result).toEqual({
        name: 'Tech Corp',
        owner_id: '300',
      });
    });
  });

  describe('toPipedriveDealCreateParams', () => {
    const pipedriveObjectFields: PipedriveObjectField[] = [
      {
        key: 'custom_field_key_1',
        name: 'Custom Field 1',
        edit_flag: true,
        field_type: 'text',
      },
      {
        key: 'custom_field_key_2',
        name: 'Custom Field 2',
        edit_flag: true,
        field_type: 'text',
      },
    ];

    test('should transform OpportunityCreateParams to Pipedrive deal creation params', () => {
      const opportunityCreateParams = {
        name: 'Deal 1',
        amount: 5000,
        ownerId: '300',
        accountId: '400',
        pipeline: 'Sales Pipeline',
        stage: 'Qualified To Buy',
      };

      const result = toPipedriveDealCreateParams(
        opportunityCreateParams,
        PIPEDRIVE_PIPELINE_STAGE_MAPPING,
        pipedriveObjectFields
      );

      expect(result).toEqual({
        title: 'Deal 1',
        value: '5000',
        user_id: 300,
        org_id: 400,
        pipeline_id: 0,
        stage_id: 1,
      });
    });

    test('should transform OpportunityCreateParams with custom fields to Pipedrive deal creation params', () => {
      const opportunityCreateParams = {
        name: 'Deal 1',
        amount: 5000,
        ownerId: '300',
        accountId: '400',
        pipeline: 'Sales Pipeline',
        stage: 'Qualified To Buy',
        customFields: {
          'Custom Field 1': 'Custom Value 1',
          'Custom Field 2': 'Custom Value 2',
        },
      };

      const result = toPipedriveDealCreateParams(
        opportunityCreateParams,
        PIPEDRIVE_PIPELINE_STAGE_MAPPING,
        pipedriveObjectFields
      );

      expect(result).toEqual({
        title: 'Deal 1',
        value: '5000',
        user_id: 300,
        org_id: 400,
        pipeline_id: 0,
        stage_id: 1,
        custom_field_key_1: 'Custom Value 1',
        custom_field_key_2: 'Custom Value 2',
      });
    });

    test('should transform OpportunityCreateParams with custom pipeline and stage to Pipedrive deal creation params', () => {
      const opportunityCreateParams = {
        name: 'Deal 2',
        amount: 10000,
        ownerId: '301',
        accountId: '401',
        pipeline: 'Custom Pipeline',
        stage: 'Stage 1',
      };

      const result = toPipedriveDealCreateParams(
        opportunityCreateParams,
        PIPEDRIVE_PIPELINE_STAGE_MAPPING,
        pipedriveObjectFields
      );

      expect(result).toEqual({
        title: 'Deal 2',
        value: '10000',
        user_id: 301,
        org_id: 401,
        pipeline_id: 1,
        stage_id: 0,
      });
    });

    test('should handle OpportunityCreateParams without custom fields', () => {
      const opportunityCreateParams = {
        name: 'Deal 3',
        amount: 15000,
        ownerId: '302',
        accountId: '402',
        pipeline: 'Custom Pipeline',
        stage: 'Stage 2',
      };

      const result = toPipedriveDealCreateParams(opportunityCreateParams, PIPEDRIVE_PIPELINE_STAGE_MAPPING, []);

      expect(result).toEqual({
        title: 'Deal 3',
        value: '15000',
        user_id: 302,
        org_id: 402,
        pipeline_id: 1,
        stage_id: 1,
      });
    });
  });
  describe('getPipelineId', () => {
    test('should return null for undefined or null pipelineNameOrId', () => {
      expect(getPipelineId(null, PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toBeNull();
      expect(getPipelineId(undefined, PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toBeNull();
    });

    test('should return pipeline id when provided pipeline id directly', () => {
      expect(getPipelineId('0', PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toEqual('0');
    });

    test('should return pipeline id when provided pipeline name', () => {
      expect(getPipelineId('Custom Pipeline', PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toEqual('1');
    });

    test('should throw error for invalid pipeline name or id', () => {
      expect(() => getPipelineId('Invalid Pipeline', PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toThrowError(
        'Pipeline not found: Invalid Pipeline'
      );
    });
  });

  describe('getStageId', () => {
    test('should return null if pipelineId or stageNameOrId is null or undefined', () => {
      expect(getStageId(null, 'Stage 1', PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toBeNull();
      expect(getStageId('0', null, PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toBeNull();
      expect(getStageId('0', undefined, PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toBeNull();
    });

    test('should throw error for invalid pipeline id', () => {
      expect(() => getStageId('InvalidPipelineId', 'Stage 1', PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toThrowError(
        'Pipeline not found: InvalidPipelineId'
      );
    });

    test('should return stage id when provided stage id directly', () => {
      expect(getStageId('0', '0', PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toEqual('0');
    });

    test('should return stage id when provided stage name', () => {
      expect(getStageId('1', 'Stage 1', PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toEqual('0');
    });

    test('should throw error for invalid stage name or id', () => {
      expect(() => getStageId('1', 'Invalid Stage', PIPEDRIVE_PIPELINE_STAGE_MAPPING)).toThrowError(
        'Stage not found: Invalid Stage'
      );
    });
  });
});
