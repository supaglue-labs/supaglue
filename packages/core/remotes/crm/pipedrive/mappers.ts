import { RemoteContact } from '@supaglue/types/crm';
import { EmailAddress, PhoneNumber } from '@supaglue/types/crm/common';
import { PipedriveRecord } from '.';

export const fromPipedrivePersonToRemoteContact = (person: PipedriveRecord): RemoteContact => {
  return {
    remoteId: person.id.toString(),
    firstName: person.first_name ?? null,
    lastName: person.last_name ?? null,
    addresses: [], // Pipedrive contacts do not have addresses
    emailAddresses: fromPipedriveEmailsToEmailAddresses(person.email),
    phoneNumbers: fromPipedrivePhonesToPhoneNumbers(person.phone),
    lifecycleStage: null,
    lastActivityAt: person.last_activity_date ? new Date(person.last_activity_date) : null,
    remoteOwnerId: person.owner_id?.id?.toString() ?? null,
    remoteAccountId: person.org_id?.id?.toString() ?? null,
    remoteCreatedAt: person.add_time ? new Date(person.add_time) : null,
    remoteUpdatedAt: person.add_time ? new Date(person.update_time) : null,
    remoteWasDeleted: !!person.delete_time,
    remoteDeletedAt: person.delete_time ? new Date(person.delete_time) : null,
    detectedOrRemoteDeletedAt: person.delete_time ? new Date(person.delete_time) : null,
    rawData: person,
  };
};

export const fromPipedriveEmailsToEmailAddresses = (emails: { label: string; value: string }[]): EmailAddress[] => {
  return emails
    .filter(({ label }) => label === 'work' || label === 'primary')
    .map((email) => ({ emailAddress: email.value, emailAddressType: email.label } as EmailAddress));
};

export const fromPipedrivePhonesToPhoneNumbers = (phoneNumbers: { label: string; value: string }[]): PhoneNumber[] => {
  return phoneNumbers
    .filter(({ label }) => label === 'mobile' || label === 'primary' || label === 'fax')
    .map((phoneNumber) => ({ phoneNumber: phoneNumber.value, phoneNumberType: phoneNumber.label } as PhoneNumber));
};
