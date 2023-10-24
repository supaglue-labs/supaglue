# Common schema for CRM

Supaglue supports the following Common Objects:

## Users

| Supaglue Common Schema Field | Salesforce Field | HubSpot Field           | Pipedrive Field | MS Dynamics 365 Sales Field |
| ---------------------------- | ---------------- | ----------------------- | --------------- | --------------------------- |
| `id`                         | `Id`             | `id`                    | ``              | ``                          |
| `name`                       | `Name`           | `${firstName lastName}` | ``              | ``                          |
| `email`                      | `Email`          | `email`                 | ``              | ``                          |
| `is_active`                  | `IsActive`       | `!archived`             | ``              | ``                          |
| `created_at`                 | `CreatedDate`    | `createdAt`             | ``              | ``                          |
| `updated_at`                 | `SystemModstamp` | `updatedAt`             | ``              | ``                          |
| `is_deleted`                 | `IsDeleted`      | `!!archived`            | ``              | ``                          |
| `last_modified_at`           | `SystemModstamp` | `updatedAt`             | ``              | ``                          |

## Leads

| Supaglue Common Schema Field           | Salesforce Field     | HubSpot Field | Pipedrive Field | MS Dynamics 365 Sales Field |
| -------------------------------------- | -------------------- | ------------- | --------------- | --------------------------- |
| `id`                                   | `Id`                 | N/A           | ``              | ``                          |
| `owner_id`                             | `OwnerId`            | N/A           | ``              | ``                          |
| `first_name`                           | `FirstName`          | N/A           | ``              | ``                          |
| `last_name`                            | `LastName`           | N/A           | ``              | ``                          |
| `lead_source`                          | `LeadSource`         | N/A           | ``              | ``                          |
| `title`                                | `Title`              | N/A           | ``              | ``                          |
| `converted_account_dd`                 | `ConvertedAccountId` | N/A           | ``              | ``                          |
| `converted_contact_id`                 | `ConvertedContactId` | N/A           | ``              | ``                          |
| `title`                                | `Title`              | N/A           | ``              | ``                          |
| `addresses[].street_1`                 | `Street`             | N/A           | ``              | ``                          |
| `addresses[].street_2`                 | N/A                  | N/A           | ``              | ``                          |
| `addresses[].city`                     | `City`               | N/A           | ``              | ``                          |
| `addresses[].state`                    | `State`              | N/A           | ``              | ``                          |
| `addresses[].postal_code`              | `PostalCode`         | N/A           | ``              | ``                          |
| `addresses[].country`                  | `Country`            | N/A           | ``              | ``                          |
| `addresses[].address_type`             | primary              | N/A           | ``              | ``                          |
| `phone_numbers[].phone_number`         | `Phone`              | N/A           | ``              | ``                          |
| `phone_numbers[].phone_number`         | `MobilePhone`        | N/A           | ``              | ``                          |
| `phone_numbers[].phone_number`         | `Fax`                | N/A           | ``              | ``                          |
| `email_addresses[].email_address`      | `Email`              | N/A           | ``              | ``                          |
| `email_addresses[].email_address_type` | primary              | N/A           | ``              | ``                          |
| `last_modified_at`                     | `SystemModstamp`     | N/A           | ``              | ``                          |
| `created_at`                           | `CreatedDate`        | N/A           | ``              | ``                          |
| `updated_at`                           | `SystemModstamp`     | N/A           | ``              | ``                          |
| `is_deleted`                           | `IsDeleted`          | N/A           | ``              | ``                          |

## Contacts

| Supaglue Common Schema Field           | Salesforce Field                 | HubSpot Field                     | Pipedrive Field | MS Dynamics 365 Sales Field |
| -------------------------------------- | -------------------------------- | --------------------------------- | --------------- | --------------------------- |
| `id`                                   | `Id`                             | `id`                              | ``              | ``                          |
| `account_id`                           | `AccountId`                      | (first company from associations) | ``              | ``                          |
| `owner_id`                             | `OwnerId`                        | `hubspot_owner_id`                | ``              | ``                          |
| `first_name`                           | `FirstName`                      | `firstname`                       | ``              | ``                          |
| `last_name`                            | `LastName`                       | `lastname`                        | ``              | ``                          |
| `addresses[].street_1`                 | `MailingStreet` OR `OtherStreet` | `address`                         | ``              | ``                          |
| `addresses[].city`                     | `MailingCity`                    | `city`                            | ``              | ``                          |
| `addresses[].state`                    | `MailingState`                   | `state`                           | ``              | ``                          |
| `addresses[].postal_code`              | `MailingPostalCode`              | `zip`                             | ``              | ``                          |
| `addresses[].country`                  | `MailingCountry`                 | `country`                         | ``              | ``                          |
| `addresses[].address_type`             | mailing OR other                 | primary                           | ``              | ``                          |
| `phone_numbers[].phone_number`         | `Phone`                          | `phone`                           | ``              | ``                          |
| `phone_numbers[].phone_number`         | `MobilePhone`                    | `mobilePhone`                     | ``              | ``                          |
| `phone_numbers[].phone_number`         | `Fax`                            | `fax`                             | ``              | ``                          |
| `phone_numbers[].phone_number_type`    | primary OR mobile or fax         | primary OR mobile or fax          | ``              | ``                          |
| `email_addresses[].email_address`      | `Email`                          | `work_email`                      | ``              | ``                          |
| `email_addresses[].email_address`      | `Email`                          | `email`                           | ``              | ``                          |
| `email_addresses[].email_address_type` | primary                          | primary OR work                   | ``              | ``                          |
| `lifecycle_stage`                      | ``                               | `id`                              | ``              | ``                          |
| `last_modified_at`                     | `LastActivityDate`               | `notes_last_updated`              | ``              | ``                          |
| `created_at`                           | `CreatedDate`                    | `createdAt`                       | ``              | ``                          |
| `updatd_at`                            | `SystemModstamp`                 | `updatedAt`                       | ``              | ``                          |
| `is_deleted`                           | `IsDeleted`                      | `archived`                        | ``              | ``                          |

## Accounts

| Supaglue Common Schema Field   | Salesforce Field    | HubSpot Field               | Pipedrive Field | MS Dynamics 365 Sales Field |
| ------------------------------ | ------------------- | --------------------------- | --------------- | --------------------------- |
| `id`                           | `Id`                | `id`                        | ``              | ``                          |
| `name`                         | `Name`              | `name`                      | ``              | ``                          |
| `description`                  | `Description`       | `description`               | ``              | ``                          |
| `owner_id`                     | `OwnerId`           | `hubspot_owner_id`          | ``              | ``                          |
| `industry`                     | `Industry`          | `industry`                  | ``              | ``                          |
| `website`                      | `Website`           | `website`                   | ``              | ``                          |
| `number_of_employees`          | `NumberOfEmployees` | `numberofemployees`         | ``              | ``                          |
| `addresses[].street_1`         | `BillingStreet`     | `address`                   | ``              | ``                          |
| `addresses[].street_2`         | N/A                 | `address2`                  | ``              | ``                          |
| `addresses[].city`             | `BillingCity`       | `city`                      | ``              | ``                          |
| `addresses[].state`            | `BillingState`      | `state`                     | ``              | ``                          |
| `addresses[].postal_code`      | `BillingPostalCode` | `zip`                       | ``              | ``                          |
| `addresses[].country`          | `BillingCountry`    | `country`                   | ``              | ``                          |
| `phone_numbers[].phone_number` | `Phone`             | `phone`                     | ``              | ``                          |
| `lifecycle_stage`              | N/A                 | `lifecyclestage`            | ``              | ``                          |
| `last_modified_at`             | `LastActivityDate`  | `updatedAt` OR `archivedAt` | ``              | ``                          |
| `created_at`                   | `CreatedDate`       | `createdAt`                 | ``              | ``                          |
| `updated_at`                   | `SystemModstamp`    | `updatedAt`                 | ``              | ``                          |
| `is_deleted`                   | `IsDeleted`         | `archived`                  | ``              | ``                          |

## Opportunities

| Supaglue Common Schema Field | Salesforce Field      | HubSpot Field                        | Pipedrive Field | MS Dynamics 365 Sales Field |
| ---------------------------- | --------------------- | ------------------------------------ | --------------- | --------------------------- |
| `id`                         | `Id`                  | `id`                                 | ``              | ``                          |
| `owner_id`                   | `OwnerId`             | `hubspot_owner_id`                   | ``              | ``                          |
| `name`                       | `Name`                | `dealname`                           | ``              | ``                          |
| `description`                | `Description`         | `description`                        | ``              | ``                          |
| `stage`                      | `StageName`           | `dealstage` (resolved to label)      | ``              | ``                          |
| `close_date`                 | `CloseDate`           | `closedate`                          | ``              | ``                          |
| `amount`                     | `Amount`              | `amount`                             | ``              | ``                          |
| `account_id`                 | `AccountId`           | (first company from associations)    | ``              | ``                          |
| `last_activity_at`           | `LastActivityDate`    | `notes_last_updated`                 | ``              | ``                          |
| `pipeline`                   | ``                    | `pipeline` (resolved to label)       | ``              | ``                          |
| `status`                     | `IsWon` OR `IsClosed` | `hs_is_closed_won` OR `hs_is_closed` | ``              | ``                          |
| `last_modified_at`           | `SystemModstamp`      | `updatedAt` OR `archivedAt`          | ``              | ``                          |
| `created_at`                 | `CreatedDate`         | `createdAt`                          | ``              | ``                          |
| `updated_at`                 | `SystemModstamp`      | `updatedAt`                          | ``              | ``                          |
| `is_deleted`                 | `IsDeleted`           | `archived`                           | ``              | ``                          |
