import { RemoteContact } from '@supaglue/types/engagement';
import { OutreachRecord } from '.';

export const fromOutreachProspectToRemoteContact = (record: OutreachRecord): RemoteContact => {
  const { id, attributes } = record;
  const out = {
    remoteId: id.toString(),
    firstName: (attributes.firstName as string) ?? null,
    lastName: (attributes.lastName as string) ?? null,
    jobTitle: (attributes.jobTitle as string) ?? null,
    address: {
      street1: (attributes.addressStreet as string) ?? null,
      street2: (attributes.addressStreet2 as string) ?? null,
      state: (attributes.addressState as string) ?? null,
      postalCode: (attributes.addressZip as string) ?? null,
      city: (attributes.addressCity as string) ?? null,
      country: (attributes.addressCountry as string) ?? null,
    },
    emailAddresses: [],
    phoneNumbers: [],
    openCount: (attributes.openCount as number) ?? 0,
    clickCount: (attributes.clickCount as number) ?? 0,
    replyCount: (attributes.replyCount as number) ?? 0,
    bouncedCount: (attributes.bouncedCount as number) ?? 0,
    remoteCreatedAt: new Date(attributes.createdAt as string),
    remoteUpdatedAt: new Date(attributes.updatedAt as string),
    remoteWasDeleted: false,
    remoteDeletedAt: null,
    detectedOrRemoteDeletedAt: null,
    rawData: record,
  };
  return out;
};
