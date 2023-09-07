import type { HubspotCompany, HubspotContact } from '@/types/hubspot';
import type { SupaglueRecord } from '@supaglue/core/lib';

export const toHubspotCompany = (record: SupaglueRecord): HubspotCompany => {
  const rawData = record._supaglue_raw_data.properties as Record<string, unknown>;

  return {
    id: record._supaglue_id,
    is_deleted: record._supaglue_is_deleted,
    description: rawData['description'] as string | null,
    city: rawData['city'] as string | null,
    country: rawData['country'] as string | null,
    zip: rawData['zip'] as string | null,
    state: rawData['state'] as string | null,
    address: rawData['address'] as string | null,
    phone: rawData['phone'] as string | null,
    industry: rawData['industry'] as string | null,
    name: rawData['name'] as string | null,
    numberofemployees: rawData['numberofemployees'] as string | null,
    hubspot_owner_id: rawData['hubspot_owner_id'] as string | null,
    domain: rawData['domain'] as string | null,
    website: rawData['website'] as string | null,
    createdate: new Date(rawData['createdate'] as string),
    notes_last_updated: new Date(rawData['notes_last_updated'] as string),
    // TODO: second address
    // TODO: system timestamp
    raw_data: rawData,
  };
};

export const toHubspotContact = (record: SupaglueRecord): HubspotContact => {
  const rawData = record._supaglue_raw_data.properties as Record<string, unknown>;

  return {
    id: record._supaglue_id,
    email: rawData['email'] as string | null,
    associatedcompanyid: rawData['associatedcompanyid'] as string | null,
    firstname: rawData['firstname'] as string | null,
    phone: rawData['phone'] as string | null,
    is_deleted: record._supaglue_is_deleted,
    lastname: rawData['lastname'] as string | null,
    city: rawData['city'] as string | null,
    country: rawData['country'] as string | null,
    zip: rawData['zip'] as string | null,
    state: rawData['state'] as string | null,
    address: rawData['address'] as string | null,
    mobilephone: rawData['mobilephone'] as string | null,
    hubspot_owner_id: rawData['hubspot_owner_id'] as string | null,
    fax: rawData['fax'] as string | null,
    jobtitle: rawData['jobtitle'] as string | null,
    createdate: new Date(rawData['createdate'] as string),
    notes_last_updated: new Date(rawData['notes_last_updated'] as string),
    // TODO: description
    // TODO: lead source
    // TODO: second address
    // TODO: system timestamp
    raw_data: rawData,
  };
};
