/**
 * Tests Outreach mappers
 *
 * @group unit/mappers/outreach
 */

import { describe, expect, it } from '@jest/globals';
import type { User } from '@sentry/node';
import type {
  Account,
  AccountCreateParams,
  Address,
  Contact,
  ContactCreateParams,
  EmailAddress,
  Mailbox,
  PhoneNumber,
  Sequence,
  SequenceCreateParams,
  SequenceState,
  SequenceStateCreateParams,
  SequenceStepCreateParams,
  SequenceTemplateCreateParams,
  SequenceTemplateId,
} from '@supaglue/types/engagement';
import type { OutreachRecord } from '.';
import { BadRequestError } from '../../../errors';
import {
  fromOutreachAccountToAccount,
  fromOutreachMailboxToMailbox,
  fromOutreachProspectToContact,
  fromOutreachSequenceStateToSequenceState,
  fromOutreachSequenceToSequence,
  fromOutreachUserToUser,
  toOutreachAccountCreateParams,
  toOutreachProspectAddressParams,
  toOutreachProspectCreateParams,
  toOutreachProspectPhoneNumbers,
  toOutreachSequenceCreateParams,
  toOutreachSequenceStateCreateParams,
  toOutreachSequenceStepCreateParams,
  toOutreachTemplateCreateParams,
} from './mappers'; // Adjust the import to your file structure

describe('Outreach mappers', () => {
  describe('fromOutreachSequenceToSequence Function', () => {
    it('should convert a valid OutreachRecord to Sequence', () => {
      const record: OutreachRecord = {
        id: 1,
        attributes: {
          name: 'Test Sequence',
          enabled: true,
          sequenceStepCount: 5,
          tags: ['tag1', 'tag2'],
          scheduleCount: 10,
          // Add other metrics attributes here...
          createdAt: '2023-09-12T12:34:56.789Z',
          updatedAt: '2023-09-13T12:34:56.789Z',
        },
        relationships: {
          owner: {
            data: {
              id: 100,
            },
          },
        },
        links: {},
      };

      const expectedResult: Sequence = {
        id: '1',
        name: 'Test Sequence',
        isEnabled: true,
        numSteps: 5,
        tags: ['tag1', 'tag2'],
        metrics: {
          scheduleCount: 10,
          openCount: 0,
          optOutCount: 0,
          clickCount: 0,
          replyCount: 0,
          deliverCount: 0,
          failureCount: 0,
          neutralReplyCount: 0,
          negativeReplyCount: 0,
          positiveReplyCount: 0,
          numRepliedProspects: 0,
          numContactedProspects: 0,
        },
        createdAt: new Date('2023-09-12T12:34:56.789Z'),
        updatedAt: new Date('2023-09-13T12:34:56.789Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-09-13T12:34:56.789Z'),
        ownerId: '100',
        rawData: record,
      };

      expect(fromOutreachSequenceToSequence(record)).toEqual(expectedResult);
    });

    it('should handle missing attributes gracefully', () => {
      const record: OutreachRecord = {
        id: 2,
        attributes: {
          enabled: false,
          sequenceStepCount: 2,
          tags: [],
          createdAt: '2023-09-14T12:34:56.789Z',
          updatedAt: '2023-09-14T12:34:56.789Z',
        },
        relationships: {},
        links: {},
      };

      const expectedResult: Sequence = {
        id: '2',
        name: null,
        isEnabled: false,
        numSteps: 2,
        tags: [],
        metrics: {
          scheduleCount: 0,
          openCount: 0,
          optOutCount: 0,
          clickCount: 0,
          replyCount: 0,
          deliverCount: 0,
          failureCount: 0,
          neutralReplyCount: 0,
          negativeReplyCount: 0,
          positiveReplyCount: 0,
          numRepliedProspects: 0,
          numContactedProspects: 0,
        },
        createdAt: new Date('2023-09-14T12:34:56.789Z'),
        updatedAt: new Date('2023-09-14T12:34:56.789Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-09-14T12:34:56.789Z'),
        ownerId: null,
        rawData: record,
      };

      expect(fromOutreachSequenceToSequence(record)).toEqual(expectedResult);
    });

    // Add more tests as necessary
  });
  describe('fromOutreachUserToUser Function', () => {
    it('should convert a valid OutreachRecord to User', () => {
      const record: OutreachRecord = {
        id: 1,
        attributes: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          createdAt: '2023-09-10T12:34:56.789Z',
          updatedAt: '2023-09-11T12:34:56.789Z',
        },
        relationships: {},
        links: {},
      };

      const expectedResult: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        createdAt: new Date('2023-09-10T12:34:56.789Z'),
        updatedAt: new Date('2023-09-11T12:34:56.789Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-09-11T12:34:56.789Z'),
        rawData: record,
      };

      expect(fromOutreachUserToUser(record)).toEqual(expectedResult);
    });

    it('should handle missing attributes gracefully', () => {
      const record: OutreachRecord = {
        id: 2,
        attributes: {
          email: 'john.doe@example.com',
          createdAt: '2023-09-12T12:34:56.789Z',
          updatedAt: '2023-09-12T12:34:56.789Z',
        },
        relationships: {},
        links: {},
      };

      const expectedResult: User = {
        id: '2',
        firstName: null,
        lastName: null,
        email: 'john.doe@example.com',
        createdAt: new Date('2023-09-12T12:34:56.789Z'),
        updatedAt: new Date('2023-09-12T12:34:56.789Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-09-12T12:34:56.789Z'),
        rawData: record,
      };

      expect(fromOutreachUserToUser(record)).toEqual(expectedResult);
    });
  });
  describe('fromOutreachMailboxToMailbox Function', () => {
    it('should convert a valid OutreachRecord to Mailbox', () => {
      const record: OutreachRecord = {
        id: 1,
        attributes: {
          email: 'test@mailbox.com',
          createdAt: '2023-09-12T12:34:56.789Z',
          updatedAt: '2023-09-13T12:34:56.789Z',
        },
        relationships: {
          user: {
            data: {
              id: 100,
            },
          },
        },
        links: {},
      };

      const expectedResult: Mailbox = {
        id: '1',
        email: 'test@mailbox.com',
        createdAt: new Date('2023-09-12T12:34:56.789Z'),
        updatedAt: new Date('2023-09-13T12:34:56.789Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-09-13T12:34:56.789Z'),
        userId: '100',
        rawData: record,
      };

      expect(fromOutreachMailboxToMailbox(record)).toEqual(expectedResult);
    });

    it('should handle missing attributes gracefully', () => {
      const record: OutreachRecord = {
        id: 2,
        attributes: {
          createdAt: '2023-09-14T12:34:56.789Z',
          updatedAt: '2023-09-14T12:34:56.789Z',
        },
        relationships: {},
        links: {},
      };

      const expectedResult: Mailbox = {
        id: '2',
        email: null,
        createdAt: new Date('2023-09-14T12:34:56.789Z'),
        updatedAt: new Date('2023-09-14T12:34:56.789Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-09-14T12:34:56.789Z'),
        userId: null,
        rawData: record,
      };

      expect(fromOutreachMailboxToMailbox(record)).toEqual(expectedResult);
    });
  });
  describe('fromOutreachAccountToAccount Function', () => {
    it('should convert a valid OutreachRecord to Account', () => {
      const record: OutreachRecord = {
        id: 1,
        attributes: {
          name: 'Test Account',
          domain: 'test.com',
          createdAt: '2023-09-12T12:34:56.789Z',
          updatedAt: '2023-09-13T12:34:56.789Z',
        },
        relationships: {
          owner: {
            data: {
              id: 100,
            },
          },
        },
        links: {},
      };

      const expectedResult: Account = {
        id: '1',
        name: 'Test Account',
        domain: 'test.com',
        ownerId: '100',
        createdAt: new Date('2023-09-12T12:34:56.789Z'),
        updatedAt: new Date('2023-09-13T12:34:56.789Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-09-13T12:34:56.789Z'),
        rawData: record,
      };

      expect(fromOutreachAccountToAccount(record)).toEqual(expectedResult);
    });
  });

  describe('fromOutreachSequenceStateToSequenceState Function', () => {
    it('should convert a valid OutreachRecord to SequenceState', () => {
      const record: OutreachRecord = {
        id: 1,
        attributes: {
          state: 'active',
          createdAt: '2023-09-12T12:34:56.789Z',
          updatedAt: '2023-09-13T12:34:56.789Z',
        },
        relationships: {
          sequence: {
            data: {
              id: 101,
            },
          },
          mailbox: {
            data: {
              id: 102,
            },
          },
          creator: {
            data: {
              id: 103,
            },
          },
          prospect: {
            data: {
              id: 104,
            },
          },
        },
        links: {},
      };

      const expectedResult: SequenceState = {
        id: '1',
        state: 'active',
        sequenceId: '101',
        mailboxId: '102',
        userId: '103',
        contactId: '104',
        createdAt: new Date('2023-09-12T12:34:56.789Z'),
        updatedAt: new Date('2023-09-13T12:34:56.789Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-09-13T12:34:56.789Z'),
        rawData: record,
      };

      expect(fromOutreachSequenceStateToSequenceState(record)).toEqual(expectedResult);
    });

    it('should handle missing attributes gracefully', () => {
      const record: OutreachRecord = {
        id: 2,
        attributes: {
          state: 'active',
          createdAt: '2023-09-14T12:34:56.789Z',
          updatedAt: '2023-09-14T12:34:56.789Z',
        },
        relationships: {},
        links: {},
      };

      const expectedResult: SequenceState = {
        id: '2',
        state: 'active',
        sequenceId: null,
        mailboxId: null,
        userId: null,
        contactId: null,
        createdAt: new Date('2023-09-14T12:34:56.789Z'),
        updatedAt: new Date('2023-09-14T12:34:56.789Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-09-14T12:34:56.789Z'),
        rawData: record,
      };

      expect(fromOutreachSequenceStateToSequenceState(record)).toEqual(expectedResult);
    });
  });

  describe('fromOutreachProspectToContact Function', () => {
    it('should correctly transform a valid OutreachRecord to a Contact', () => {
      const input: OutreachRecord = {
        id: 1,
        attributes: {
          firstName: 'John',
          lastName: 'Doe',
          title: 'Developer',
          addressStreet: '123 Street',
          addressStreet2: 'Apt 1',
          addressState: 'State',
          addressZip: '12345',
          addressCity: 'City',
          addressCountry: 'Country',
          emailContacts: [{ email: 'test@example.com', email_type: 'work' }],
          mobilePhones: ['12345'],
          homePhones: ['23456'],
          workPhones: [],
          openCount: 5,
          clickCount: 3,
          replyCount: 2,
          bouncedCount: 1,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z',
        },
        relationships: {
          owner: { data: { id: '2' } },
          account: { data: { id: '3' } },
        },
        links: {},
      };

      const expectedResult: Contact = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Developer',
        address: {
          street1: '123 Street',
          street2: 'Apt 1',
          state: 'State',
          postalCode: '12345',
          city: 'City',
          country: 'Country',
        },
        emailAddresses: [
          {
            emailAddress: 'test@example.com',
            emailAddressType: 'work',
          },
        ],
        phoneNumbers: [
          {
            phoneNumber: '12345',
            phoneNumberType: 'mobile',
          },
          {
            phoneNumber: '23456',
            phoneNumberType: 'home',
          },
        ],
        openCount: 5,
        clickCount: 3,
        replyCount: 2,
        bouncedCount: 1,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        isDeleted: false,
        lastModifiedAt: new Date('2023-01-02T00:00:00Z'),
        ownerId: '2',
        accountId: '3',
        rawData: input,
      };

      expect(fromOutreachProspectToContact(input)).toEqual(expectedResult);
    });
  });

  describe('toOutreachProspectPhoneNumbers Function', () => {
    it('should return undefined if phoneNumbers is undefined', () => {
      expect(toOutreachProspectPhoneNumbers(undefined)).toBeUndefined();
    });

    it('should return an object with empty arrays if phoneNumbers is an empty array', () => {
      expect(toOutreachProspectPhoneNumbers([])).toEqual({
        homePhones: [],
        workPhones: [],
        otherPhones: [],
        mobilePhones: [],
      });
    });

    it('should correctly categorize phone numbers based on their type', () => {
      const phoneNumbers: PhoneNumber[] = [
        { phoneNumber: '00000', phoneNumberType: 'primary' },
        { phoneNumber: '12345', phoneNumberType: 'home' },
        { phoneNumber: '67890', phoneNumberType: 'work' },
        { phoneNumber: '11111', phoneNumberType: 'mobile' },
        { phoneNumber: '22222', phoneNumberType: 'other' },
      ];

      expect(toOutreachProspectPhoneNumbers(phoneNumbers)).toEqual({
        homePhones: ['12345'],
        workPhones: ['67890'],
        otherPhones: ['22222'],
        mobilePhones: ['00000', '11111'],
      });
    });

    it('should ignore phone numbers with null phoneNumber or phoneNumberType', () => {
      const phoneNumbers: PhoneNumber[] = [
        { phoneNumber: null, phoneNumberType: 'home' },
        { phoneNumber: '44444', phoneNumberType: null },
      ];

      expect(toOutreachProspectPhoneNumbers(phoneNumbers)).toEqual({
        homePhones: [],
        workPhones: [],
        otherPhones: [],
        mobilePhones: [],
      });
    });
  });

  describe('toOutreachAccountCreateParams Function', () => {
    it('should correctly map input values to a data structure with undefined ownerId', () => {
      const input: AccountCreateParams = {
        name: 'Test Company',
        domain: 'test.com',
        customFields: { field1: 'value1', field2: undefined },
      };

      const expectedResult = {
        data: {
          type: 'account',
          attributes: {
            domain: 'test.com',
            name: 'Test Company',
            field1: 'value1',
          },
        },
      };

      expect(toOutreachAccountCreateParams(input)).toEqual(expectedResult);
    });

    it('should correctly map input values to a data structure with null ownerId', () => {
      const input: AccountCreateParams = {
        name: 'Test Company',
        domain: 'test.com',
        ownerId: null,
        customFields: { field1: 'value1', field2: undefined },
      };

      const expectedResult = {
        data: {
          type: 'account',
          attributes: {
            domain: 'test.com',
            name: 'Test Company',
            field1: 'value1',
          },
          relationships: {
            owner: null,
          },
        },
      };

      expect(toOutreachAccountCreateParams(input)).toEqual(expectedResult);
    });

    it('should correctly map input values to a data structure with a string ownerId', () => {
      const input: AccountCreateParams = {
        name: 'Test Company',
        domain: 'test.com',
        ownerId: '123',
        customFields: { field1: 'value1', field2: undefined },
      };

      const expectedResult = {
        data: {
          type: 'account',
          attributes: {
            domain: 'test.com',
            name: 'Test Company',
            field1: 'value1',
          },
          relationships: {
            owner: {
              data: {
                type: 'user',
                id: 123,
              },
            },
          },
        },
      };

      expect(toOutreachAccountCreateParams(input)).toEqual(expectedResult);
    });
  });
  describe('toOutreachProspectCreateParams Function', () => {
    const baseInput: ContactCreateParams = {
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'Developer',
      customFields: { field1: 'value1' },
    };

    const address: Address = {
      street1: '123 Main St',
      street2: 'Apt 4B',
      state: 'NY',
      city: 'New York',
      postalCode: '10001',
      country: 'USA',
    };

    const emailAddresses: EmailAddress[] = [{ emailAddress: 'john.doe@example.com', emailAddressType: 'work' }];

    const phoneNumbers: PhoneNumber[] = [{ phoneNumber: '1234567890', phoneNumberType: 'mobile' }];

    it('should correctly map input values to a data structure without ownerId and accountId', () => {
      const input = { ...baseInput, address, emailAddresses, phoneNumbers };
      const expectedResult = {
        data: {
          type: 'prospect',
          attributes: {
            firstName: 'John',
            lastName: 'Doe',
            title: 'Developer',
            addressStreet: '123 Main St',
            addressStreet2: 'Apt 4B',
            addressState: 'NY',
            addressCity: 'New York',
            addressZip: '10001',
            addressCountry: 'USA',
            emails: ['john.doe@example.com'],
            homePhones: [],
            workPhones: [],
            otherPhones: [],
            mobilePhones: ['1234567890'],
            field1: 'value1',
          },
        },
      };
      expect(toOutreachProspectCreateParams(input)).toEqual(expectedResult);
    });

    it('should correctly handle null address', () => {
      const input = { ...baseInput, address: null };
      const expectedResult = {
        data: {
          type: 'prospect',
          attributes: {
            firstName: 'John',
            lastName: 'Doe',
            title: 'Developer',
            addressStreet: null,
            addressStreet2: null,
            addressState: null,
            addressCity: null,
            addressZip: null,
            addressCountry: null,
            field1: 'value1',
          },
        },
      };
      expect(toOutreachProspectCreateParams(input)).toEqual(expectedResult);
    });

    it('should correctly map input values to a data structure with ownerId and accountId', () => {
      const input = { ...baseInput, address, emailAddresses, phoneNumbers, ownerId: '123', accountId: '456' };
      const expectedResult = {
        data: {
          type: 'prospect',
          attributes: {
            firstName: 'John',
            lastName: 'Doe',
            title: 'Developer',
            addressStreet: '123 Main St',
            addressStreet2: 'Apt 4B',
            addressState: 'NY',
            addressCity: 'New York',
            addressZip: '10001',
            addressCountry: 'USA',
            emails: ['john.doe@example.com'],
            homePhones: [],
            workPhones: [],
            otherPhones: [],
            mobilePhones: ['1234567890'],
            field1: 'value1',
          },
          relationships: {
            owner: {
              data: {
                type: 'user',
                id: '123',
              },
            },
            account: {
              data: {
                type: 'account',
                id: '456',
              },
            },
          },
        },
      };
      expect(toOutreachProspectCreateParams(input)).toEqual(expectedResult);
    });
  });
  describe('toOutreachSequenceStateCreateParams Function', () => {
    it('should throw BadRequestError if mailboxId is undefined', () => {
      const input: SequenceStateCreateParams = {
        contactId: '1',
        sequenceId: '2',
      };

      expect(() => toOutreachSequenceStateCreateParams(input)).toThrow(BadRequestError);
    });

    it('should return correct data structure if all parameters are provided', () => {
      const input: SequenceStateCreateParams = {
        contactId: '1',
        sequenceId: '2',
        mailboxId: '3',
      };

      const expectedResult = {
        data: {
          type: 'sequenceState',
          relationships: {
            prospect: {
              data: {
                type: 'prospect',
                id: 1,
              },
            },
            sequence: {
              data: {
                type: 'sequence',
                id: 2,
              },
            },
            mailbox: {
              data: {
                type: 'mailbox',
                id: 3,
              },
            },
          },
        },
      };

      expect(toOutreachSequenceStateCreateParams(input)).toEqual(expectedResult);
    });

    it('should correctly parse string ids to integers', () => {
      const input: SequenceStateCreateParams = {
        contactId: '123',
        sequenceId: '456',
        mailboxId: '789',
      };

      const expectedResult = {
        data: {
          type: 'sequenceState',
          relationships: {
            prospect: {
              data: {
                type: 'prospect',
                id: 123,
              },
            },
            sequence: {
              data: {
                type: 'sequence',
                id: 456,
              },
            },
            mailbox: {
              data: {
                type: 'mailbox',
                id: 789,
              },
            },
          },
        },
      };

      expect(toOutreachSequenceStateCreateParams(input)).toEqual(expectedResult);
    });
  });

  describe('toOutreachSequenceCreateParams Function', () => {
    it('should return correct data structure if ownerId is undefined', () => {
      const input: SequenceCreateParams = {
        name: 'Test Sequence',
        type: 'team',
      };

      const expectedResult = {
        data: {
          attributes: {
            name: 'Test Sequence',
            tags: undefined,
          },
          type: 'sequence',
        },
      };

      expect(toOutreachSequenceCreateParams(input)).toEqual(expectedResult);
    });

    it('should return correct data structure if ownerId is defined', () => {
      const input: SequenceCreateParams = {
        name: 'Test Sequence',
        ownerId: '123',
        type: 'private',
        tags: ['tag1', 'tag2'],
      };

      const expectedResult = {
        data: {
          attributes: {
            name: 'Test Sequence',
            tags: ['tag1', 'tag2'],
          },
          relationships: {
            owner: {
              data: {
                id: 123,
                type: 'user',
              },
            },
          },
          type: 'sequence',
        },
      };

      expect(toOutreachSequenceCreateParams(input)).toEqual(expectedResult);
    });

    it('should correctly include customFields in the attributes', () => {
      const input: SequenceCreateParams = {
        name: 'Test Sequence',
        type: 'team',
        customFields: {
          field1: 'value1',
          field2: 'value2',
        },
      };

      const expectedResult = {
        data: {
          attributes: {
            name: 'Test Sequence',
            tags: undefined,
            field1: 'value1',
            field2: 'value2',
          },
          type: 'sequence',
        },
      };

      expect(toOutreachSequenceCreateParams(input)).toEqual(expectedResult);
    });
  });

  describe('toOutreachSequenceStepCreateParams Function', () => {
    it('should create a parameter object for an auto step with template ID', () => {
      const input: SequenceStepCreateParams = {
        sequenceId: '12345',
        order: 1,
        type: 'auto_email',
        isReply: false,
        template: { id: '5678' } as SequenceTemplateId,
        taskNote: 'Test Note',
        customFields: { custom1: 'value1' },
      };

      const expectedResult = {
        data: {
          attributes: {
            stepType: 'auto_email',
            order: 1,
            date: undefined,
            interval: 0,
            taskNote: 'Test Note',
            custom1: 'value1',
          },
          relationships: {
            sequence: {
              data: {
                id: 12345,
                type: 'sequence',
              },
            },
          },
          type: 'sequenceStep',
        },
      };

      expect(toOutreachSequenceStepCreateParams(input)).toEqual(expectedResult);
    });

    it('should create a parameter object for a manual step with template create params', () => {
      const input: SequenceStepCreateParams = {
        sequenceId: '54321',
        order: 2,
        type: 'manual_email',
        isReply: true,
        template: {
          body: 'Test body',
          subject: 'Test subject',
          name: 'Test name',
          customFields: { custom2: 'value2' },
        } as SequenceTemplateCreateParams,
        customFields: { custom3: 'value3' },
      };

      const expectedResult = {
        data: {
          attributes: {
            stepType: 'manual_email',
            order: 2,
            date: undefined,
            interval: 0,
            custom3: 'value3',
          },
          relationships: {
            sequence: {
              data: {
                id: 54321,
                type: 'sequence',
              },
            },
          },
          type: 'sequenceStep',
        },
      };

      expect(toOutreachSequenceStepCreateParams(input)).toEqual(expectedResult);
    });
  });
  describe('toOutreachTemplateCreateParams Function', () => {
    it('should create template params with all fields', () => {
      const input: SequenceTemplateCreateParams = {
        name: 'Test Template',
        body: '<p>Hello, World!</p>',
        subject: 'Test Subject',
        to: ['recipient1@example.com'],
        cc: ['cc1@example.com'],
        bcc: ['bcc1@example.com'],
        customFields: { custom1: 'value1' },
      };

      const expectedResult = {
        data: {
          attributes: {
            name: 'Test Template',
            bodyHtml: '<p>Hello, World!</p>',
            subject: 'Test Subject',
            toRecipients: ['recipient1@example.com'],
            ccRecipients: ['cc1@example.com'],
            bccRecipients: ['bcc1@example.com'],
            custom1: 'value1',
          },
          type: 'template',
        },
      };

      expect(toOutreachTemplateCreateParams(input)).toEqual(expectedResult);
    });

    it('should create template params with only mandatory fields', () => {
      const input: SequenceTemplateCreateParams = {
        name: 'Test Template',
        body: '<p>Hello, World!</p>',
        subject: 'Test Subject',
      };

      const expectedResult = {
        data: {
          attributes: {
            name: 'Test Template',
            bodyHtml: '<p>Hello, World!</p>',
            subject: 'Test Subject',
          },
          type: 'template',
        },
      };

      expect(toOutreachTemplateCreateParams(input)).toEqual(expectedResult);
    });

    // Additional tests for various cases can be added here
  });
  describe('toOutreachProspectAddressParams Function', () => {
    it('should return empty object when address is undefined', () => {
      expect(toOutreachProspectAddressParams()).toEqual({});
    });

    it('should return null fields when address is null', () => {
      expect(toOutreachProspectAddressParams(null)).toEqual({
        addressStreet: null,
        addressStreet2: null,
        addressState: null,
        addressCity: null,
        addressZip: null,
        addressCountry: null,
      });
    });

    it('should return address fields when address is provided', () => {
      const address = {
        street1: '123 Main St',
        street2: 'Apt 4B',
        state: 'NY',
        city: 'New York',
        postalCode: '10001',
        country: 'USA',
      };

      expect(toOutreachProspectAddressParams(address)).toEqual({
        addressStreet: '123 Main St',
        addressStreet2: 'Apt 4B',
        addressState: 'NY',
        addressCity: 'New York',
        addressZip: '10001',
        addressCountry: 'USA',
      });
    });

    // Additional tests for various cases can be added here
  });
});
