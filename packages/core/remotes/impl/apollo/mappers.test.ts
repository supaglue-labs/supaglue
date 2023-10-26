/**
 * Tests Apollo mappers
 *
 * @group unit/mappers/apollo
 */

import { describe, expect, it } from '@jest/globals';
import type { ContactCreateParams, ContactUpdateParams } from '@supaglue/types/engagement';
import {
  fromApolloAccountToAccount,
  fromApolloContactToContact,
  fromApolloContactToSequenceStates,
  fromApolloEmailAccountsToMailbox,
  fromApolloEmailerCampaignToSequence,
  fromApolloUserToUser,
  getRawAddressString,
  toApolloAccountCreateParams,
  toApolloContactCreateParams,
  toApolloContactUpdateParams,
  toApolloSequenceStateCreateParams,
} from './mappers';

describe('Conversion functions', () => {
  it('should convert Apollo account to account correctly', () => {
    const record = {
      id: '1',
      name: 'Test Company',
      domain: 'testcompany.com',
      owner_id: '1234',
      created_at: '2023-09-12T10:00:00Z',
    };

    const expected = {
      id: '1',
      name: 'Test Company',
      domain: 'testcompany.com',
      ownerId: '1234',
      createdAt: new Date('2023-09-12T10:00:00Z'),
      updatedAt: null,
      lastModifiedAt: new Date('2023-09-12T10:00:00Z'),
      isDeleted: false,
      rawData: record,
    };

    expect(fromApolloAccountToAccount(record)).toEqual(expected);
  });

  it('should convert Apollo contact to contact correctly', () => {
    const record = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      title: 'Engineer',
      street_address: '123 Test St',
      city: 'TestCity',
      state: 'TestState',
      country: 'TestCountry',
      postal_code: '12345',
      email: 'john.doe@example.com',
      phone_numbers: [{ sanitized_number: '123456789', type: 'home' }],
      owner_id: '1234',
      account_id: '5678',
      created_at: '2023-09-12T10:00:00Z',
      updated_at: '2023-09-12T11:00:00Z',
    };

    const expected = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'Engineer',
      address: {
        street1: '123 Test St',
        street2: null,
        city: 'TestCity',
        state: 'TestState',
        country: 'TestCountry',
        postalCode: '12345',
      },
      emailAddresses: [
        {
          emailAddress: 'john.doe@example.com',
          emailAddressType: 'primary',
        },
      ],
      phoneNumbers: [
        {
          phoneNumber: '123456789',
          phoneNumberType: 'home',
        },
      ],
      ownerId: '1234',
      accountId: '5678',
      openCount: 0,
      clickCount: 0,
      bouncedCount: 0,
      replyCount: 0,
      createdAt: new Date('2023-09-12T10:00:00Z'),
      updatedAt: new Date('2023-09-12T11:00:00Z'),
      lastModifiedAt: new Date('2023-09-12T11:00:00Z'),
      isDeleted: false,
      rawData: record,
    };

    expect(fromApolloContactToContact(record)).toEqual(expected);
  });

  it('should convert Apollo user to user correctly', () => {
    const record = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      created_at: '2023-09-12T10:00:00Z',
    };

    const expected = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      createdAt: new Date('2023-09-12T10:00:00Z'),
      updatedAt: null,
      lastModifiedAt: new Date('2023-09-12T10:00:00Z'),
      isDeleted: false,
      rawData: record,
      isLocked: null,
    };

    expect(fromApolloUserToUser(record)).toEqual(expected);
  });

  it('should convert Apollo email accounts to mailbox correctly', () => {
    const record = {
      id: '123',
      user_id: '456',
      email: 'example@example.com',
      last_synced_at: '2023-09-12T10:00:00Z',
    };

    const expected = {
      id: '123',
      userId: '456',
      email: 'example@example.com',
      createdAt: null,
      updatedAt: new Date('2023-09-12T10:00:00Z'),
      lastModifiedAt: new Date('2023-09-12T10:00:00Z'),
      isDeleted: false,
      rawData: record,
      isDisabled: null,
    };

    expect(fromApolloEmailAccountsToMailbox(record)).toEqual(expected);
  });

  it('should convert Apollo contact to sequence states correctly', () => {
    const record = {
      id: '123',
      contact_campaign_statuses: [
        {
          id: '1',
          emailer_campaign_id: '2',
          send_email_from_email_account_id: '3',
          added_by_user_id: '4',
          status: 'active',
          added_at: '2023-09-12T10:00:00Z',
        },
      ],
    };

    const expected = [
      {
        id: '1',
        sequenceId: '2',
        contactId: '123',
        mailboxId: '3',
        userId: '4',
        state: 'active',
        createdAt: new Date('2023-09-12T10:00:00Z'),
        updatedAt: null,
        lastModifiedAt: new Date('2023-09-12T10:00:00Z'),
        isDeleted: false,
        rawData: record.contact_campaign_statuses[0],
      },
    ];

    expect(fromApolloContactToSequenceStates(record)).toEqual(expected);
  });
  it('should create raw address string correctly', () => {
    const address = {
      street1: '123 Main St',
      street2: null,
      city: 'Sample City',
      state: 'Sample State',
      postalCode: '12345',
      country: 'Sample Country',
    };

    const expected = '123 Main St, Sample City, Sample State, 12345, Sample Country';

    expect(getRawAddressString(address)).toEqual(expected);
  });

  it('should convert to Apollo account create params correctly', () => {
    const params = {
      name: 'Test Account',
      domain: 'test.com',
    };

    const expected = {
      name: 'Test Account',
      domain: 'test.com',
    };

    expect(toApolloAccountCreateParams(params)).toEqual(expected);
  });

  it('should convert to Apollo contact create params correctly', () => {
    const params: ContactCreateParams = {
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'Developer',
      emailAddresses: [{ emailAddress: 'john.doe@example.com', emailAddressType: 'primary' }],
      address: {
        street1: '123 Main St',
        street2: null,
        city: 'Sample City',
        state: 'Sample State',
        postalCode: '12345',
        country: 'Sample Country',
      },
      accountId: '123',
      customFields: {
        field1: 'value1',
      },
    };

    const expected = {
      first_name: 'John',
      last_name: 'Doe',
      title: 'Developer',
      email: 'john.doe@example.com',
      present_raw_address: '123 Main St, Sample City, Sample State, 12345, Sample Country',
      account_id: '123',
      field1: 'value1',
    };

    expect(toApolloContactCreateParams(params)).toEqual(expected);
  });

  it('should convert to Apollo contact update params correctly', () => {
    const params: ContactUpdateParams = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'Developer',
      emailAddresses: [{ emailAddress: 'john.doe@example.com', emailAddressType: 'primary' }],
      address: {
        street1: '123 Main St',
        street2: null,
        city: 'Sample City',
        state: 'Sample State',
        postalCode: '12345',
        country: 'Sample Country',
      },
      phoneNumbers: [
        { phoneNumber: '123456789', phoneNumberType: 'work' },
        { phoneNumber: '987654321', phoneNumberType: 'home' },
        { phoneNumber: '1112223333', phoneNumberType: 'primary' },
      ],
      accountId: '123',
      customFields: {
        field1: 'value1',
      },
    };

    const expected = {
      first_name: 'John',
      last_name: 'Doe',
      title: 'Developer',
      email: 'john.doe@example.com',
      present_raw_address: '123 Main St, Sample City, Sample State, 12345, Sample Country',
      corporate_phone: '123456789',
      home_phone: '987654321',
      mobile_phone: '1112223333',
      account_id: '123',
      field1: 'value1',
    };

    expect(toApolloContactUpdateParams(params)).toEqual(expected);

    // Should defalt to mobile if both mobile and primary are specified
    params.phoneNumbers?.push({ phoneNumber: '0000000000', phoneNumberType: 'mobile' });
    expected.mobile_phone = '0000000000';
    expect(toApolloContactUpdateParams(params)).toEqual(expected);
  });

  it('should convert to Apollo sequence state create params correctly', () => {
    const params = {
      contactId: '123',
      sequenceId: '456',
      mailboxId: '789',
      userId: '101',
    };

    const expected = {
      contact_ids: ['123'],
      emailer_campaign_id: '456',
      send_email_from_email_account_id: '789',
      userId: '101',
    };

    expect(toApolloSequenceStateCreateParams(params)).toEqual(expected);
  });

  test('should convert ApolloEmailerCampaign to Sequence format', () => {
    const apolloEmailerCampaign = {
      name: 'Test Campaign',
      created_at: '2022-01-01T00:00:00.000Z',
      id: '123456',
      user_id: '789',
      num_steps: 3,
      active: true,
      archived: false,
      label_ids: ['lbl1234', 'lbl_zzzz'],
      unique_scheduled: 100,
      unique_delivered: 90,
      unique_bounced: 5,
      unique_opened: 80,
      unique_replied: 10,
      unique_demoed: 20,
      unique_clicked: 30,
      unique_unsubscribed: 5,
      bounce_rate: 0.05,
      open_rate: 0.8,
      click_rate: 0.3,
      reply_rate: 0.1,
      spam_blocked_rate: 0.01,
      opt_out_rate: 0.02,
      demo_rate: 0.2,
    };

    const { lastModifiedAt: _, ...result } = fromApolloEmailerCampaignToSequence(apolloEmailerCampaign);

    expect(result).toMatchInlineSnapshot(`
      {
        "createdAt": 2022-01-01T00:00:00.000Z,
        "id": "123456",
        "isArchived": false,
        "isDeleted": false,
        "isEnabled": true,
        "metrics": {
          "bounceRate": 0.05,
          "clickRate": 0.3,
          "demoRate": 0.2,
          "openRate": 0.8,
          "optOutRate": 0.02,
          "replyRate": 0.1,
          "spamBlockedRate": 0.01,
          "uniqueBounced": 5,
          "uniqueClicked": 30,
          "uniqueDelivered": 90,
          "uniqueDemoed": 20,
          "uniqueOpened": 80,
          "uniqueReplied": 10,
          "uniqueScheduled": 100,
          "uniqueUnsubscribed": 5,
        },
        "name": "Test Campaign",
        "numSteps": 3,
        "ownerId": "789",
        "rawData": {
          "active": true,
          "archived": false,
          "bounce_rate": 0.05,
          "click_rate": 0.3,
          "created_at": "2022-01-01T00:00:00.000Z",
          "demo_rate": 0.2,
          "id": "123456",
          "label_ids": [
            "lbl1234",
            "lbl_zzzz",
          ],
          "name": "Test Campaign",
          "num_steps": 3,
          "open_rate": 0.8,
          "opt_out_rate": 0.02,
          "reply_rate": 0.1,
          "spam_blocked_rate": 0.01,
          "unique_bounced": 5,
          "unique_clicked": 30,
          "unique_delivered": 90,
          "unique_demoed": 20,
          "unique_opened": 80,
          "unique_replied": 10,
          "unique_scheduled": 100,
          "unique_unsubscribed": 5,
          "user_id": "789",
        },
        "shareType": "team",
        "tags": [
          "lbl1234",
          "lbl_zzzz",
        ],
        "updatedAt": null,
      }
    `);
  });
});
