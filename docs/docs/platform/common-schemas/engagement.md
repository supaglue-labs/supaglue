# Common schema for Engagement

:::info
This is under construction.
:::

Supaglue supports the following Common Objects:

## Sequences

| Supaglue Common Schema Field | Apollo Field        | Salesloft Field                | Outreach Field                   |
| ---------------------------- | ------------------- | ------------------------------ | -------------------------------- |
| `id`                         | `id`                | `id`                           | `id`                             |
| `name`                       | `name`              | `name`                         | `name`                           |
| `is_enabled`                 | `active`            | `!draft`                       | `enabled`                        |
| `num_steps`                  | `num_steps`         | (Fetched from /steps endpoint) | `sequenceStepCount`              |
| `tags`                       | `[]`                | `tags`                         | `tags`                           |
| `metrics`                    | Any                 | Any                            | Any                              |
| `owner_id`                   | `user_id`           | `owner?.id`                    | `relationships?.owner?.data?.id` |
| `created_at`                 | `created_at`        | `created_at`                   | `createdAt`                      |
| `updated_at`                 | N/A                 | `updated_at`                   | `updatedAt`                      |
| `last_modified_at`           | `createdat`         | `updated_at`                   | `updatedAt`                      |
| `is_deleted`                 | `archived` OR false | `archived_at`                  | false                            |
| `is_archived`                | `archived`          | `current_state`                | `locked`                         |
| `share_type`                 | `permissions`       | `shared`                       | `shareType`                      |

## Sequence States

| Supaglue Common Schema Field | Apollo Field                                                   | Salesloft Field | Outreach Field                      |
| ---------------------------- | -------------------------------------------------------------- | --------------- | ----------------------------------- |
| `id`                         | `id`                                                           | `id`            | `id`                                |
| `state`                      | `status`                                                       | `current_state` | `state`                             |
| `sequence_id`                | `contact_campaign_statuses[].email_campaign_id`                | `cadence?.id`   | `relationships?.sequence?.data?.id` |
| `mailbox_id`                 | `contact_campaign_statuses[].send_email_from_email_account_id` | null            | `relationships?.mailbox?.data?.id`  |
| `contact_id`                 | `contact_id`                                                   | `person?.id`    | `relationships?.prospect?.data?.id` |
| `user_id`                    | `contact_campaign_statuses[].added_by_user_id`                 | `user?.id`      | `relationships?.creators?.data?.id` |
| `created_at`                 | `added_at`                                                     | `created_at`    | `createdAt`                         |
| `updated_at`                 | N/A                                                            | `updated_at`    | `updatedAt`                         |
| `last_modified_at`           | `added_at`                                                     | `updated_at`    | `updatedAt`                         |
| `is_deleted`                 | false                                                          | false           | false                               |

## Users

| Supaglue Common Schema Field | Apollo Field | Salesloft Field | Outreach Field |
| ---------------------------- | ------------ | --------------- | -------------- |
| `id`                         | `id`         | `id`            | `id`           |
| `first_name`                 | `first_name` | `first_name`    | `firstName`    |
| `last_name`                  | `last_name`  | `last_name`     | `lastName`     |
| `email`                      | `email`      | `email`         | `email`        |
| `created_at`                 | `created_at` | `created_at`    | `createdAt`    |
| `updated_at`                 | N/A          | `updated_at`    | `updatedAt`    |
| `last_modified_at`           | `created_at` | `updated_at`    | `updatedAt`    |
| `is_deleted`                 | false        | false           | false          |
| `is_locked`                  | N/A          | `active`        | `locked`       |

## Contacts

| Supaglue Common Schema Field           | Apollo Field                                       | Salesloft Field                                                          | Outreach Field                     |
| -------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| `id`                                   | `id`                                               | `id`                                                                     | `id`                               |
| `first_name`                           | `first_name`                                       | `first_name`                                                             | `firstName`                        |
| `last_name`                            | `last_name`                                        | `last_name`                                                              | `lastName`                         |
| `job_title`                            | `title`                                            | `title`                                                                  | `title`                            |
| `address.street_1`                     | `street_address`                                   | null                                                                     | `addressStreet`                    |
| `address.street_2`                     | N/A                                                | null                                                                     | `addressStreet2`                   |
| `address.city`                         | `city`                                             | `city`                                                                   | `addressCity`                      |
| `address.state`                        | `state`                                            | `state`                                                                  | `addressState`                     |
| `address.country`                      | `country`                                          | `country`                                                                | `addressCountry`                   |
| `address.postal_code`                  | `postal_code`                                      | null                                                                     | `addressZip`                       |
| `email_addresses[].email_address`      | `email`                                            | `email_address` OR `personal_email_address` OR `secondary_email_address` | `email`                            |
| `email_addresses[].email_address_type` | primary                                            | primary OR personal OR null                                              | work OR personal OR null           |
| `phone_numbers[].phone_number`         | `phone_numbers[].sanitizied_phone`                 | `phone` OR `home_phone` OR `mobile_phone`                                | `mobilePhones[].phone`             |
| `phone_numbers[].phone_number_type`    | home OR mobile OR work_hq OR work OR other OR null | primary OR home OR mobile                                                | mobile OR home OR work OR other    |
| `owner_id`                             | `owner_id`                                         | `owner?.id`                                                              | `relationships?.owner?.data?.id`   |
| `account_id`                           | `account_id`                                       | `account?.id`                                                            | `relationships?.account?.data?.id` |
| `open_count`                           | `0`                                                | `counts?.emails_viewed`                                                  | `openCount`                        |
| `click_count`                          | `0`                                                | `counts?.emails_clicked`                                                 | `clickCount`                       |
| `bounced_count`                        | `0`                                                | `counts?.emails_bounced`                                                 | `bouncedCount`                     |
| `reply_count`                          | `0`                                                | `counts?.emails_replied_to`                                              | `replyCount`                       |
| `created_at`                           | `created_at`                                       | `created_at`                                                             | `createdAt`                        |
| `updated_at`                           | `updated_at`                                       | `updated_at`                                                             | `updatedAt`                        |
| `last_modified_at`                     | `created_at`                                       | `updated_at`                                                             | `updatedAt`                        |
| `is_deleted`                           | false                                              | false                                                                    | false                              |

## Accounts

| Supaglue Common Schema Field | Apollo Field | Salesloft Field | Outreach Field                   |
| ---------------------------- | ------------ | --------------- | -------------------------------- |
| `id`                         | `id`         | `id`            | `id`                             |
| `name`                       | `name`       | `name`          | `name`                           |
| `domain`                     | `domain`     | `domain`        | `domain`                         |
| `owner_id`                   | `owner_id`   | `owner?.id`     | `relationships?.owner?.data?.id` |
| `created_at`                 | `created_at` | `created_at`    | `createdAt`                      |
| `updated_at`                 | N/A          | `updated_at`    | `updatedAt`                      |
| `last_modified_at`           | `created_at` | `updated_at`    | `updatedAt`                      |
| `is_deleted`                 | false        | false           | false                            |

## Mailboxes

| Supaglue Common Schema Field | Apollo Field     | Salesloft Field | Outreach Field                  |
| ---------------------------- | ---------------- | --------------- | ------------------------------- |
| `id`                         | `id`             | N/A             | `id`                            |
| `user_id`                    | `user_id`        | N/A             | `relationships?.user?.data?.id` |
| `email`                      | `email`          | N/A             | `email`                         |
| `created_at`                 | N/A              | N/A             | `createdAt`                     |
| `updated_at`                 | `last_synced_at` | N/A             | `updatedAt`                     |
| `last_modified_at`           | `last_synced_at` | N/A             | `updatedAt`                     |
| `is_deleted`                 | N/A              | N/A             | false                           |
| `is_disabled`                | `active`         | N/A             | `sendDisabled`                  |
