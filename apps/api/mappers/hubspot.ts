import type { HubspotCompany, HubspotContact } from '@/types/hubspot';
import type { SupaglueStandardRecord } from '@supaglue/core/lib';

export const toHubspotCompany = (record: SupaglueStandardRecord): HubspotCompany => {
  const rawData = record._supaglue_raw_data;
  const properties = rawData.properties as Record<string, unknown>;

  return {
    id: record._supaglue_id,
    is_deleted: record._supaglue_is_deleted,
    description: properties['description'] as string | null,
    city: properties['city'] as string | null,
    country: properties['country'] as string | null,
    zip: properties['zip'] as string | null,
    state: properties['state'] as string | null,
    address: properties['address'] as string | null,
    phone: properties['phone'] as string | null,
    industry: properties['industry'] as string | null,
    name: properties['name'] as string | null,
    numberofemployees: properties['numberofemployees'] as string | null,
    hubspot_owner_id: properties['hubspot_owner_id'] as string | null,
    domain: properties['domain'] as string | null,
    website: properties['website'] as string | null,
    createdate: new Date(properties['createdate'] as string),
    notes_last_updated: new Date(properties['notes_last_updated'] as string),
    // TODO: second address
    // TODO: system timestamp
    raw_data: rawData,
  };
};

export const toHubspotContact = (record: SupaglueStandardRecord): HubspotContact => {
  const rawData = record._supaglue_raw_data;
  const properties = rawData.properties as Record<string, unknown>;

  return {
    id: record._supaglue_id,
    email: properties['email'] as string | null,
    associatedcompanyid: properties['associatedcompanyid'] as string | null,
    firstname: properties['firstname'] as string | null,
    phone: properties['phone'] as string | null,
    is_deleted: record._supaglue_is_deleted,
    lastname: properties['lastname'] as string | null,
    city: properties['city'] as string | null,
    country: properties['country'] as string | null,
    zip: properties['zip'] as string | null,
    state: properties['state'] as string | null,
    address: properties['address'] as string | null,
    mobilephone: properties['mobilephone'] as string | null,
    hubspot_owner_id: properties['hubspot_owner_id'] as string | null,
    fax: properties['fax'] as string | null,
    jobtitle: properties['jobtitle'] as string | null,
    createdate: new Date(properties['createdate'] as string),
    notes_last_updated: new Date(properties['notes_last_updated'] as string),
    // TODO: description
    // TODO: lead source
    // TODO: second address
    // TODO: system timestamp
    raw_data: rawData,
  };
};
