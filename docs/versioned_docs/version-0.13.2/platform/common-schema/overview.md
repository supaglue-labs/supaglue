import ThemedImage from '@theme/ThemedImage';

# Common schema

<ThemedImage
alt="common schema"
width="50%"
sources={{
      light: '/img/common-schema-diagram.png',
      dark: '/img/common-schema-diagram.png',
    }}
/>

Supaglue applies a common schema to normalize [Standard Objects](../objects/overview#standard-object) and fields across providers within a single category. These are known as **Common Objects**. Common Objects have a 1-n relationship between your application and Provider objects.

Common schema differs from [Objects](../objects/overview): Objects can only have a 1-1 relationship between your application and Provider objects, with no normalization.

Common schema differs from [Entities](../entities/overview): With Entities, you, the developer, determine the normalization, while Supaglue determines the Common Schema normalization.

## Syncing

In the Management Portal, go to **Configuration --> Sync Config**. Under `Common Objects`, select the objects you want to be synced from `user`, `lead`, `contact`, `account`, or `opportunity`.

<ThemedImage
alt="common object sync config"
width="50%"
sources={{
      light: '/img/common-object-sync-config.png',
      dark: '/img/common-object-sync-config.png',
    }}
/>

Upon a customer going through their Oauth flow using an [Embedded Link](../managed-auth#embedded-links), Supaglue will create a Connection and start syncing the configured Common Objects to your Destination.

## Writing

### Common Schema

Write to objects that are standard in Providers using Supaglue's Common Schema with the endpoints listed under the [Unified CRM Actions API](../../api/v2/crm/unified-crm-api) or [Unified Engagement Actions API](../../api/v2/engagement/unified-engagement-api).

### Custom Objects / Custom Object Records

Define and then write to objects that are custom in Providers using Supaglue's Unified Custom Objects Actions API allows you to:

- Create custom objects
- Create custom object records
- Create association types between objects
- Create associations between records

#### Example

Suppose you want to store information about competitors relevant to a particular Salesforce Opportunity. You could use Supaglue's Custom Objects API to do the following:

1. Create a custom object called `CompetitorInfo`.
1. Create an association type between `Opportunity` and `CompetitorInfo`.
1. When you create a new `Opportunity` record, find an existing `CompetitorInfo` record (or create a new one) and associate it with the `Opportunity` record.

## Supported Common Objects

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
