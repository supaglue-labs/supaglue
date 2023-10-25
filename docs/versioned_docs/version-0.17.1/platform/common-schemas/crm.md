# Common schema for CRM

Supaglue supports the following Common Objects:

## Users

| Supaglue Common Schema Field | Salesforce Field | HubSpot Field           | Pipedrive Field | MS Dynamics 365 Sales Field         |
| ---------------------------- | ---------------- | ----------------------- | --------------- | ----------------------------------- |
| `id`                         | `Id`             | `id`                    | `id`            | `systemuserid`                      |
| `name`                       | `Name`           | `${firstName lastName}` | `name`          | `fullname`                          |
| `email`                      | `Email`          | `email`                 | `email`         | `internalemailaddress`              |
| `is_active`                  | `IsActive`       | `!archived`             | `active_flag`   | `!isdisabled`                       |
| `created_at`                 | `CreatedDate`    | `createdAt`             | `created`       | `overridencreatedon` OR `createdon` |
| `updated_at`                 | `SystemModstamp` | `updatedAt`             | `modified`      | `modifiedon`                        |
| `is_deleted`                 | `IsDeleted`      | `!!archived`            | false           | `deletedstate`                      |
| `last_modified_at`           | `SystemModstamp` | `updatedAt`             | `modified`      | `modifiedon`                        |

## Leads

| Supaglue Common Schema Field           | Salesforce Field                  | HubSpot Field | Pipedrive Field   | MS Dynamics 365 Sales Field             |
| -------------------------------------- | --------------------------------- | ------------- | ----------------- | --------------------------------------- |
| `id`                                   | `Id`                              | N/A           | `id`              | `leadid`                                |
| `owner_id`                             | `OwnerId`                         | N/A           | `owner_id`        | `_ownerid_value`                        |
| `first_name`                           | `FirstName`                       | N/A           | N/A               | `firstname`                             |
| `last_name`                            | `LastName`                        | N/A           | N/A               | `lastname`                              |
| `lead_source`                          | `LeadSource`                      | N/A           | `source_name`     | N/A                                     |
| `title`                                | `Title`                           | N/A           | `title`           | `jobtitle`                              |
| `company`                              | `Company`                         | N/A           | N/A               | `companyname`                           |
| `converted_account_id`                 | `ConvertedAccountId`              | N/A           | `organization_id` | `_accountid_value`                      |
| `converted_contact_id`                 | `ConvertedContactId`              | N/A           | `person_id`       | `_contactid_value`                      |
| `addresses[].street_1`                 | `Street`                          | N/A           | N/A               | `address{1,2,3}_line1`                  |
| `addresses[].street_2`                 | N/A                               | N/A           | N/A               | `address{1,2,3}_line2`                  |
| `addresses[].city`                     | `City`                            | N/A           | N/A               | `address{1,2,3}_city`                   |
| `addresses[].state`                    | `State`                           | N/A           | N/A               | `address{1,2,3}_stateorprovince`        |
| `addresses[].postal_code`              | `PostalCode`                      | N/A           | N/A               | `address{1,2,3}_postalcode`             |
| `addresses[].country`                  | `Country`                         | N/A           | N/A               | `address{1,2,3}_country`                |
| `addresses[].address_type`             | primary                           | N/A           | N/A               | primary OR billing OR shipping OR other |
| `phone_numbers[].phone_number`         | `Phone` OR `MobilePhone` OR `Fax` | N/A           | N/A               | `telephone{1,2,3}`                      |
| `phone_numbers[].phone_number_type`    | primary OR mobile OR fax          | N/A           | N/A               | primary OR other                        |
| `email_addresses[].email_address`      | `Email`                           | N/A           | N/A               | `emailaddress{1,2,3}`                   |
| `email_addresses[].email_address_type` | primary                           | N/A           | N/A               | primary OR other                        |
| `last_modified_at`                     | `SystemModstamp`                  | N/A           | N/A               | `modifiedon`                            |
| `created_at`                           | `CreatedDate`                     | N/A           | `update_time`     | `overridencreatedon` OR `createdon`     |
| `updated_at`                           | `SystemModstamp`                  | N/A           | `update_time`     | `modifiedon`                            |
| `is_deleted`                           | `IsDeleted`                       | N/A           | `is_archived`     | false                                   |

## Contacts

| Supaglue Common Schema Field           | Salesforce Field                  | HubSpot Field                     | Pipedrive Field                | MS Dynamics 365 Sales Field             |
| -------------------------------------- | --------------------------------- | --------------------------------- | ------------------------------ | --------------------------------------- |
| `id`                                   | `Id`                              | `id`                              | `id`                           | `contactid`                             |
| `account_id`                           | `AccountId`                       | (first company from associations) | `org_id?.value`                | `_parentcustomerid_value`               |
| `owner_id`                             | `OwnerId`                         | `hubspot_owner_id`                | `owner_id?.id`                 | `_ownerid_value`                        |
| `first_name`                           | `FirstName`                       | `firstname`                       | `first_name`                   | `firstname`                             |
| `last_name`                            | `LastName`                        | `lastname`                        | `last_name`                    | `lastname`                              |
| `addresses[].street_1`                 | `MailingStreet` OR `OtherStreet`  | `address`                         | N/A                            | `address{1,2}_line1`                    |
| `addresses[].street_2`                 | N/A                               | N/A                               | N/A                            | `address{1,2}_line2`                    |
| `addresses[].city`                     | `MailingCity`                     | `city`                            | N/A                            | `address{1,2}_city`                     |
| `addresses[].state`                    | `MailingState`                    | `state`                           | N/A                            | `address{1,2}_stateorprovince`          |
| `addresses[].postal_code`              | `MailingPostalCode`               | `zip`                             | N/A                            | `address{1,2}_postalcode`               |
| `addresses[].country`                  | `MailingCountry`                  | `country`                         | N/A                            | `address{1,2}_country`                  |
| `addresses[].address_type`             | mailing OR other                  | primary                           | N/A                            | primary OR shipping OR billing OR other |
| `phone_numbers[].phone_number`         | `Phone` OR `MobilePhone` OR `Fax` | `phone` OR `mobilephone` Or `fax` | `phoneNumbers[].phoneNumber`   | `telephone{1,2,3}`                      |
| `phone_numbers[].phone_number_type`    | primary OR mobile or fax          | primary OR mobile or fax          | mobile OR primary OR fax       | primary OR other                        |
| `email_addresses[].email_address`      | `Email`                           | `work_email` OR `email`           | `emailAddress`                 | `emailaddress{1,2}`                     |
| `email_addresses[].email_address_type` | primary                           | primary OR work                   | primary OR work                | primary OR other                        |
| `lifecycle_stage`                      | N/A                               | `id`                              | N/A                            | N/A                                     |
| `last_modified_at`                     | `LastActivityDate`                | `notes_last_updated`              | `delete_time` OR `update_time` | `modifiedon`                            |
| `created_at`                           | `CreatedDate`                     | `createdAt`                       | `add_time`                     | `overridencreatedon` OR `createdon`     |
| `updated_at`                           | `SystemModstamp`                  | `updatedAt`                       | `update_time`                  | `modifiedon`                            |
| `is_deleted`                           | `IsDeleted`                       | `archived`                        | `delete_time`                  | false                                   |

## Accounts

| Supaglue Common Schema Field   | Salesforce Field    | HubSpot Field               | Pipedrive Field                           | MS Dynamics 365 Sales Field         |
| ------------------------------ | ------------------- | --------------------------- | ----------------------------------------- | ----------------------------------- |
| `id`                           | `Id`                | `id`                        | `id`                                      | `accountid`                         |
| `name`                         | `Name`              | `name`                      | `name`                                    | `name`                              |
| `description`                  | `Description`       | `description`               | N/A                                       | `description`                       |
| `owner_id`                     | `OwnerId`           | `hubspot_owner_id`          | `owner_id?.id`                            | `_ownerid_value`                    |
| `industry`                     | `Industry`          | `industry`                  | N/A                                       | `industrycode` (resolved to label)  |
| `website`                      | `Website`           | `website`                   | N/A                                       | `websiteurl`                        |
| `number_of_employees`          | `NumberOfEmployees` | `numberofemployees`         | `people_count`                            | `numberofemployees`                 |
| `addresses[].street_1`         | `BillingStreet`     | `address`                   | `address_street_number` OR `adress_route` | `address{1,2}_line1`                |
| `addresses[].street_2`         | N/A                 | `address2`                  | `address_subpremise`                      | `address{1,2}_line2`                |
| `addresses[].city`             | `BillingCity`       | `city`                      | `address_locality`                        | `address{1,2}_city`                 |
| `addresses[].state`            | `BillingState`      | `state`                     | `address_admin_area_level_1`              | `address{1,2}_stateorprovince`      |
| `addresses[].postal_code`      | `BillingPostalCode` | `zip`                       | `address_postal_code`                     | `address{1,2}_postalcode`           |
| `addresses[].country`          | `BillingCountry`    | `country`                   | `address_country`                         | `address{1,2}_country`              |
| `phone_numbers[].phone_number` | `Phone`             | `phone`                     | N/A                                       | `telephone{1,2,3}`                  |
| `lifecycle_stage`              | N/A                 | `lifecyclestage`            | N/A                                       | N/A                                 |
| `last_modified_at`             | `LastActivityDate`  | `updatedAt` OR `archivedAt` | `update_time` OR `delete_time`            | `modifiedon`                        |
| `created_at`                   | `CreatedDate`       | `createdAt`                 | `add_time`                                | `overridencreatedon` OR `createdon` |
| `updated_at`                   | `SystemModstamp`    | `updatedAt`                 | `update_time`                             | `modifiedon`                        |
| `is_deleted`                   | `IsDeleted`         | `archived`                  | `delete_time`                             | false                               |

## Opportunities

| Supaglue Common Schema Field | Salesforce Field      | HubSpot Field                        | Pipedrive Field                   | MS Dynamics 365 Sales Field                                                    |
| ---------------------------- | --------------------- | ------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------ |
| `id`                         | `Id`                  | `id`                                 | `id`                              | `opportunityid`                                                                |
| `owner_id`                   | `OwnerId`             | `hubspot_owner_id`                   | `user_id?.id`                     | `_ownerid_value`                                                               |
| `name`                       | `Name`                | `dealname`                           | `title`                           | `name`                                                                         |
| `description`                | `Description`         | `description`                        | N/A                               | `description`                                                                  |
| `stage`                      | `StageName`           | `dealstage` (resolved to label)      | `stage_id` (resolved to label)    | `stageid_processstage@odata.nextLink` (resolved to label)                      |
| `close_date`                 | `CloseDate`           | `closedate`                          | `close_time`                      | `actualclosedate`                                                              |
| `amount`                     | `Amount`              | `amount`                             | `value`                           | `actualvalue`                                                                  |
| `account_id`                 | `AccountId`           | (first company from associations)    | `org_id?.value`                   | `_parentaccountid_value`                                                       |
| `last_activity_at`           | `LastActivityDate`    | `notes_last_updated`                 | `last_activity_date`              | N/A                                                                            |
| `pipeline`                   | N/A                   | `pipeline` (resolved to label)       | `pipeline_id` (resolved to label) | `opportunity_leadtoopportunitysalesprocess@odata.nextLink` (resolved to label) |
| `status`                     | `IsWon` OR `IsClosed` | `hs_is_closed_won` OR `hs_is_closed` | `open` OR `won` Or `lost`         | `statuscode`                                                                   |
| `last_modified_at`           | `SystemModstamp`      | `updatedAt` OR `archivedAt`          | `update_time` OR `delete_time`    | `modifiedon`                                                                   |
| `created_at`                 | `CreatedDate`         | `createdAt`                          | `add_time`                        | `overridencreatedon` OR `createdon`                                            |
| `updated_at`                 | `SystemModstamp`      | `updatedAt`                          | `update_time`                     | `modifiedon`                                                                   |
| `is_deleted`                 | `IsDeleted`           | `archived`                           | `deleted`                         | false                                                                          |
