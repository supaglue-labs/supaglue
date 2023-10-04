/**
 * Tests Salesloft mappers
 *
 * @group unit/mappers/salesloft
 */

import { describe, expect, it } from '@jest/globals';
import type { ContactCreateParams, SequenceStateCreateParams } from '@supaglue/types/engagement';
import {
  fromSalesloftAccountToAccount,
  fromSalesloftCadenceMembershipToSequenceState,
  fromSalesloftCadenceToSequence,
  fromSalesloftPersonToContact,
  fromSalesloftUserToUser,
  toSalesloftAccountCreateParams,
  toSalesloftContactCreateParams,
  toSalesloftSequenceStateCreateParams,
} from './mappers';

describe('Salesloft mapper tests', () => {
  describe('fromSalesloftAccountToAccount', () => {
    it('should map record to Account correctly', () => {
      const record = {
        id: 123,
        name: 'Test Account',
        domain: 'test.com',
        owner: { id: 1 },
        created_at: '2023-09-12T10:00:00Z',
        updated_at: '2023-09-12T12:00:00Z',
      };

      const expected = {
        id: '123',
        name: 'Test Account',
        domain: 'test.com',
        ownerId: '1',
        createdAt: new Date('2023-09-12T10:00:00Z'),
        updatedAt: new Date('2023-09-12T12:00:00Z'),
        lastModifiedAt: new Date('2023-09-12T12:00:00Z'),
        isDeleted: false,
        rawData: record,
      };

      expect(fromSalesloftAccountToAccount(record)).toEqual(expected);
    });
  });

  describe('fromSalesloftPersonToContact', () => {
    it('should map record to Contact correctly', () => {
      const record = {
        id: 456,
        first_name: 'John',
        last_name: 'Doe',
        title: 'Developer',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        counts: {
          emails_viewed: 10,
          emails_clicked: 5,
          emails_bounced: 1,
          emails_replied_to: 2,
        },
        email_address: 'test@supaglue.com',
        phone: '123456789',
        owner: { id: 1 },
        account: { id: 123 },
        created_at: '2023-09-12T10:00:00Z',
        updated_at: '2023-09-12T12:00:00Z',
      };

      const expected = {
        id: '456',
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Developer',
        address: {
          street1: null,
          street2: null,
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: null,
        },
        emailAddresses: [
          {
            emailAddress: 'test@supaglue.com',
            emailAddressType: 'primary',
          },
        ],
        phoneNumbers: [
          {
            phoneNumber: '123456789',
            phoneNumberType: 'primary',
          },
        ],
        ownerId: '1',
        accountId: '123',
        openCount: 10,
        clickCount: 5,
        bouncedCount: 1,
        replyCount: 2,
        createdAt: new Date('2023-09-12T10:00:00Z'),
        updatedAt: new Date('2023-09-12T12:00:00Z'),
        lastModifiedAt: new Date('2023-09-12T12:00:00Z'),
        isDeleted: false,
        rawData: record,
      };

      expect(fromSalesloftPersonToContact(record)).toEqual(expected);
    });
  });
  it('should convert Salesloft user to User object correctly', () => {
    const record = {
      id: 123,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      created_at: new Date('2023-01-01T10:00:00Z'),
      updated_at: new Date('2023-01-02T10:00:00Z'),
    };
    const expected = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      createdAt: new Date('2023-01-01T10:00:00Z'),
      updatedAt: new Date('2023-01-02T10:00:00Z'),
      lastModifiedAt: new Date('2023-01-02T10:00:00Z'),
      isDeleted: false,
      rawData: record,
    };
    expect(fromSalesloftUserToUser(record)).toEqual(expected);
  });

  it('should convert Salesloft cadence to Sequence object correctly', () => {
    const record = {
      id: 123,
      name: 'Test Cadence',
      draft: false,
      counts: {
        count_a: 1,
        count_b: 2,
      },
      tags: ['tag1', 'tag2'],
      owner: { id: 456 },
      created_at: new Date('2023-01-01T10:00:00Z'),
      updated_at: new Date('2023-01-02T10:00:00Z'),
      archived_at: false,
    };
    const stepCount = 2;
    const expected = {
      id: '123',
      name: 'Test Cadence',
      isEnabled: true,
      numSteps: stepCount,
      metrics: {
        countA: 1,
        countB: 2,
      },
      tags: ['tag1', 'tag2'],
      ownerId: '456',
      createdAt: new Date('2023-01-01T10:00:00Z'),
      updatedAt: new Date('2023-01-02T10:00:00Z'),
      lastModifiedAt: new Date('2023-01-02T10:00:00Z'),
      isDeleted: false,
      rawData: record,
    };
    expect(fromSalesloftCadenceToSequence(record, stepCount)).toEqual(expected);
  });

  it('should convert Salesloft cadence membership to SequenceState object correctly', () => {
    const record = {
      id: 123,
      current_state: 'active',
      person: { id: 789 },
      cadence: { id: 456 },
      user: { id: 101 },
      created_at: new Date('2023-01-01T10:00:00Z'),
      updated_at: new Date('2023-01-02T10:00:00Z'),
    };
    const expected = {
      id: '123',
      state: 'active',
      contactId: '789',
      sequenceId: '456',
      mailboxId: null,
      userId: '101',
      createdAt: new Date('2023-01-01T10:00:00Z'),
      updatedAt: new Date('2023-01-02T10:00:00Z'),
      lastModifiedAt: new Date('2023-01-02T10:00:00Z'),
      isDeleted: false,
      rawData: record,
    };
    expect(fromSalesloftCadenceMembershipToSequenceState(record)).toEqual(expected);
  });

  it('should convert to Salesloft Account create params correctly', () => {
    const record = {
      name: 'Test Company',
      domain: 'testcompany.com',
      ownerId: '123',
    };
    const expected = {
      name: 'Test Company',
      domain: 'testcompany.com',
      owner_id: 123,
    };
    expect(toSalesloftAccountCreateParams(record)).toEqual(expected);
  });

  it('should convert to Salesloft Contact create params correctly', () => {
    const contact: ContactCreateParams = {
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'Engineer',
      address: null,
      emailAddresses: [{ emailAddress: 'john.doe@example.com', emailAddressType: 'primary' }],
      phoneNumbers: [{ phoneNumber: '123456789', phoneNumberType: 'primary' }],
      ownerId: '1234',
      accountId: '5678',
      customFields: {
        field1: 'value1',
        field2: 'value2',
      },
    };

    const expected = {
      first_name: 'John',
      last_name: 'Doe',
      title: 'Engineer',
      email_address: 'john.doe@example.com',
      phone: '123456789',
      owner_id: 1234,
      account_id: 5678,
      field1: 'value1',
      field2: 'value2',
    };

    expect(toSalesloftContactCreateParams(contact)).toEqual(expected);
  });

  it('should convert to Salesloft SequenceState create params correctly', () => {
    const sequenceState: SequenceStateCreateParams = {
      contactId: '12345',
      sequenceId: '67890',
      userId: '11223',
    };

    const expected = {
      person_id: '12345',
      cadence_id: '67890',
      user_id: '11223',
    };

    expect(toSalesloftSequenceStateCreateParams(sequenceState)).toEqual(expected);
  });
});
