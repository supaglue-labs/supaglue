import type { SalesforceAccount, SalesforceContact } from '@/types/salesforce';
import type { SupaglueRecord } from '@supaglue/core/lib';

export const toSalesforceAccount = (record: SupaglueRecord): SalesforceAccount => {
  const rawData = record._supaglue_raw_data;

  return {
    Id: record._supaglue_id,
    IsDeleted: record._supaglue_is_deleted,
    Description: rawData['Description'] as string | null,
    BillingCity: rawData['BillingCity'] as string | null,
    BillingCountry: rawData['BillingCountry'] as string | null,
    BillingPostalCode: rawData['BillingPostalCode'] as string | null,
    BillingState: rawData['BillingState'] as string | null,
    BillingStreet: rawData['BillingStreet'] as string | null,
    ShippingCity: rawData['ShippingCity'] as string | null,
    ShippingCountry: rawData['ShippingCountry'] as string | null,
    ShippingPostalCode: rawData['ShippingPostalCode'] as string | null,
    ShippingState: rawData['ShippingState'] as string | null,
    ShippingStreet: rawData['ShippingStreet'] as string | null,
    Phone: rawData['Phone'] as string | null,
    Fax: rawData['Fax'] as string | null,
    Industry: rawData['Industry'] as string | null,
    Name: rawData['Name'] as string | null,
    NumberOfEmployees: rawData['NumberOfEmployees'] as number | null,
    OwnerId: rawData['OwnerId'] as string | null,
    Website: rawData['Website'] as string | null,
    LastActivityDate: rawData['LastActivityDate'] ? new Date(rawData['LastActivityDate'] as string) : null,
    CreatedDate: new Date(rawData['CreatedDate'] as string),
    SystemModstamp: new Date(rawData['SystemModstamp'] as string),
    raw_data: rawData,
  };
};

export const toSalesforceContact = (record: SupaglueRecord): SalesforceContact => {
  const rawData = record._supaglue_raw_data;

  return {
    Id: record._supaglue_id,
    Description: rawData['Description'] as string | null,
    Email: rawData['Email'] as string | null,
    AccountId: rawData['AccountId'] as string | null,
    FirstName: rawData['FirstName'] as string | null,
    HomePhone: rawData['HomePhone'] as string | null,
    IsDeleted: record._supaglue_is_deleted,
    LastActivityDate: rawData['LastActivityDate'] ? new Date(rawData['LastActivityDate'] as string) : null,
    LastName: rawData['LastName'] as string | null,
    LeadSource: rawData['LeadSource'] as string | null,
    MailingCity: rawData['MailingCity'] as string | null,
    MailingCountry: rawData['MailingCountry'] as string | null,
    MailingPostalCode: rawData['MailingPostalCode'] as string | null,
    MailingState: rawData['MailingState'] as string | null,
    MailingStreet: rawData['MailingStreet'] as string | null,
    MobilePhone: rawData['MobilePhone'] as string | null,
    OwnerId: rawData['OwnerId'] as string | null,
    Phone: rawData['Phone'] as string | null,
    Fax: rawData['Fax'] as string | null,
    Title: rawData['Title'] as string | null,
    CreatedDate: new Date(rawData['CreatedDate'] as string),
    SystemModstamp: new Date(rawData['SystemModstamp'] as string),
    raw_data: rawData,
  };
};
