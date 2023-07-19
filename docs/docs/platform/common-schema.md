---
description: ''
sidebar_position: 6
---

# Common schema

Supaglue applies a common schema to normalize [Standard Objects](standard-objects) and fields across providers within a single category. These are known as **Common Objects**.

### Common objects

Supaglue syncs common objects across multiple providers and transforms them into a category-specific (e.g. CRM) normalized schema. There are three types of columns:

- **Supaglue metadata fields**: these specify the application, customer, provider, and timestamps associated with the managed sync.
- **Common object fields**: the normalized fields associated with the synced object and the connector category.
- **Raw data**: the raw source data is returned in a JSON blob.

Here's an example of a destination schema associated with a managed sync for a CRM Contact object:

| Field Name                | Data Type |
| ------------------------- | --------- |
| \_supaglue_application_id | String    |
| \_supaglue_customer_id    | String    |
| \_supaglue_provider_name  | String    |
| \_supaglue_emitted_at     | Timestamp |
| \_supaglue_is_deleted     | Boolean   |
| account_id                | String    |
| addresses                 | json      |
| created_at                | Timestamp |
| email_addresses           | json      |
| first_name                | String    |
| id                        | String    |
| is_deleted                | Boolean   |
| last_activity_at          | Timestamp |
| last_modified_at          | Timestamp |
| last_name                 | String    |
| lifecycle_stage           | String    |
| owner_id                  | String    |
| phone_numbers             | json      |
| raw_data                  | json      |
| updated_at                | Timestamp |

Supaglue supports the following Common Objects:

### Users

| Supaglue Common Schema Field | Salesforce Field   | HubSpot Field                  |
| ---------------------------- | ------------------ | ------------------------------ |
| `remoteId`                   | `Id`               | `id`                           |
| `name`                       | `Name`             | `(firstName, lastName)`        |
| `email`                      | `Email`            | `email`                        |
| `isActive`                   | `IsActive`         | `!archived`                    |
| `remoteCreatedAt`            | `CreatedDate`      | `createdAt`                    |
| `remoteUpdatedAt`            | `LastModifiedDate` | `updatedAt`                    |
| `remoteWasDeleted`           | `IsDeleted`        | `!!archived`                   |
| `remoteDeletedAt`            |                    | `null`                         |
| `detectedOrRemoteDeletedAt`  |                    | `archived ? new Date() : null` |

### Leads

| Supaglue Common Schema Field    | Salesforce Field   | HubSpot Field |
| ------------------------------- | ------------------ | ------------- |
| `remoteId`                      | `Id`               |               |
| `remoteOwnerId`                 | `OwnerId`          |               |
| `firstName`                     | `FirstName`        |               |
| `lastName`                      | `LastName`         |               |
| `addresses[].street1`           | `Street`           |               |
| `addresses[].city`              | `City`             |               |
| `addresses[].state`             | `State`            |               |
| `addresses[].postalCode`        | `PostalCode`       |               |
| `addresses[].country`           | `Country`          |               |
| `phoneNumbers[].phoneNumber`    | `Phone`            |               |
| `phoneNumbers[].phoneNumber`    | `MobilePhone`      |               |
| `phoneNumbers[].phoneNumber`    | `Fax`              |               |
| `emailAddresses[].emailAddress` | `Email`            |               |
| `lastActivityAt`                | `LastActivityDate` |               |
| `remoteCreatedAt`               | `CreatedDate`      |               |
| `remoteUpdatedAt`               | `SystemModstamp`   |               |
| `remoteWasDeleted`              | `IsDeleted`        |               |

### Contacts

| Supaglue Common Schema Field     | Salesforce Field                 | HubSpot Field         |
| -------------------------------- | -------------------------------- | --------------------- |
| `remoteId`                       | `Id`                             | `id`                  |
| `remoteAccountId`                | `AccountId`                      | (from associations)   |
| `remoteOwnerId`                  | `OwnerId`                        | `hubspot_owner_id`    |
| `firstName`                      | `FirstName`                      | `firstname`           |
| `lastName`                       | `LastName`                       | `lastname`            |
| `addresses[].street1`            | `MailingStreet` OR `OtherStreet` | `address`             |
| `addresses[].city`               | `MailingCity`                    | `city`                |
| `addresses[].state`              | `MailingState`                   | `state`               |
| `addresses[].postalCode`         | `MailingPostalCode`              | `zip`                 |
| `addresses[].country`            | `MailingCountry`                 | `country`             |
| `addresses[].addressType`        | `mailing` OR `other`             | `primary`             |
| `phoneNumbers[].phoneNumber`     | `Phone`                          | `phone`               |
| `phoneNumbers[].phoneNumber`     | `MobilePhone`                    | `mobilePhone`         |
| `phoneNumbers[].phoneNumber`     | `Fax`                            | `fax`                 |
| `phoneNumbers[].phoneNumberType` |
| `emailAddresses[].emailAddress`  | `Email`                          | `email`, `work_email` |
| `lastActivityAt`                 | `LastActivityDate`               | `notes_last_updated`  |
| `remoteCreatedAt`                | `CreatedDate`                    | `createdAt`           |
| `remoteUpdatedAt`                | `SystemModstamp`                 | `updatedAt`           |
| `remoteWasDeleted`               | `IsDeleted`                      | `archived`            |

### Accounts

| Supaglue Common Schema Field | Salesforce Field    | HubSpot Field        |
| ---------------------------- | ------------------- | -------------------- |
| `remoteId`                   | `Id`                | `id`                 |
| `name`                       | `Name`              | `name`               |
| `description`                | `Description`       | `description`        |
| `remoteOwnerId`              | `OwnerId`           | `hubspot_owner_id`   |
| `industry`                   | `Industry`          | `industry`           |
| `website`                    | `Website`           | `website`            |
| `numberOfEmployees`          | `NumberOfEmployees` | `numberofemployees`  |
| `addresses[].street1`        | `BillingStreet`     | `address`            |
| `addresses[].street2`        |                     | `address2`           |
| `addresses[].city`           | `BillingCity`       | `city`               |
| `addresses[].state`          | `BillingState`      | `state`              |
| `addresses[].postalCode`     | `BillingPostalCode` | `zip`                |
| `addresses[].country`        | `BillingCountry`    | `country`            |
| `phoneNumbers[].phoneNumber` | `Phone`             | `phone`              |
| `lifecycleStage`             |                     | `lifecyclestage`     |
| `lastActivityAt`             | `LastActivityDate`  | `notes_last_updated` |
| `remoteCreatedAt`            | `CreatedDate`       | `createdAt`          |
| `remoteUpdatedAt`            | `SystemModstamp`    | `updatedAt`          |
| `remoteWasDeleted`           | `IsDeleted`         | `archived`           |

### Opportunities

| Supaglue Common Schema Field | Salesforce Field   | HubSpot Field        |
| ---------------------------- | ------------------ | -------------------- |
| `remoteId`                   | `Id`               | `id`                 |
| `remoteOwnerId`              | `OwnerId`          | `hubspot_owner_id`   |
| `name`                       | `Name`             | `dealname`           |
| `description`                | `Description`      | `description`        |
| `stage`                      | `StageName`        | `dealstage`          |
| `closeDate`                  | `CloseDate`        | `closedate`          |
| `amount`                     | `Amount`           | `amount`             |
| `remoteAccountId`            | `AccountId`        | (from associations)  |
| `lastActivityAt`             | `LastActivityDate` | `notes_last_updated` |
| `remoteCreatedAt`            | `CreatedDate`      | `createdAt`          |
| `remoteUpdatedAt`            | `SystemModstamp`   | `updatedAt`          |
