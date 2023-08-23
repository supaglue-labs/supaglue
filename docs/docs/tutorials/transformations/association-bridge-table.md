import ThemedImage from '@theme/ThemedImage';

# Association Bridge Table (Hubspot)

This tutorial will show how to land a bridge table in your using Supaglue and Inngest for associating Hubspot Contacts and Deals.

## Prerequisites

This tutorial assumes you have gone through Supaglue's [Quickstart](../quickstart), created a [Hubspot integration](../integrations/hubspot), completed the [Webhooks tutorial](../listen-for-webhooks), and will use the following technologies:

- NextJS
- Typescript
- HTTP
- Inngest
- Prisma
- Postgres

This tutorial assumes that you have setup a NextJs app with Inngest, setup Sync completion webhooks for Inngest consumption, and Prisma for both your production tables as well as the Supaglue destination tables.

## Overview
When syncing data between Hubspot and your database, you often need to associate entities like Contacts and Deals together. However, these systems don't natively support many-to-many relationships.

In this tutorial, we will:

1. Use Supaglue to sync Hubspot Contacts and Deals to a postgres destination 
2. Use webhooks to listen for Sync events
3. Use Inggest to trigger a secondary workflow to populate a Bridge Table in your production database between the Contacts and Deals you synced, with Foreign Keys to associate them

  a. The bridge table will contain the following columns:
    - `customer_id`: The unique ID for the customer whose data you are syncing
    - `provider_name`: The provider name (`hubspot`, in thise case)
    - `supaglue_contact_id`: The original ID for the contact as assigned by Supaglue
    - `supaglue_deal_id`: The original ID for the deal as assigned by Supaglue
    - `contact_id`: The ID your application has assigned to this contact, used as a Foreign Key to the `contacts` table
        - If the contact does not exist in the `contacts` table, it will be kept as a `NULL`
    - `deal_id`: The ID your application has assigned to this deal, used as a Foreign Key to the `deals` table
        - If the deal does not exist in the `deals` table, it will be kept as a `NULL`
    - `last_modified_at`: The timestamp at which this row was last modified
  
  b. The bridge table will have:
    - Unique constraint on [`customer_id`, `provider_name`, `supaglue_contact_id`, `supaglue_deal_id`]
    - Unique constraint on [`contact_id`, `deal_id`]

## Set up your Inngest Function

### Filter out irrelevant events

To ensure that you're only acting upon sync completion events that are relevant, let's first filter them out:

```ts
const transformedSyncedData = inngest.createFunction(
  { name: "Transform data from Supaglue" },
  { event: "supaglue/sync.complete" },
  async ({ event, step }) => {
    // TODO: need to have something in place to make sure that at most
    // one of these handlers is running at a time for a given provider/customer/object

    // Treat as SyncComplete event
    const data = event.data as SyncComplete;

    if (data.result !== "SUCCESS") {
      return { event, body: "Sync failed" };
    }

    // ...
  }
);
```

### Sync Deals

```ts
    async function processOpportunities() {
      const newMaxLastModifiedAtMs = await step.run('Process hubspot deals from supaglue', async () => {
        const supaglueDeals = await supagluePrisma.supaglueHubSpotDeal.findMany({
          where: {
            supaglue_provider_name: provider_name,
            supaglue_customer_id: customer_id,
            supaglue_last_modified_at: {
              gt: lastMaxModifiedAt,
            },
          },
        });

        if (!supaglueDeals.length) {
          return undefined;
        }

        let maxLastModifiedAtMs = 0;

        // TODO: don't iterate one by one
        for (const supaglueDeal of supaglueDeals) {
          const lastModifiedAtMs = supaglueDeal.supaglue_last_modified_at.getTime();
          if (lastModifiedAtMs > maxLastModifiedAtMs) {
            maxLastModifiedAtMs = lastModifiedAtMs;
          }

          if (supaglueDeal.supaglue_is_deleted) {
            await prisma.$transaction(async (tx) => {
              // delete record
              await tx.opportunity.deleteMany({
                where: {
                  providerName: supaglueDeal.supaglue_provider_name,
                  customerId: supaglueDeal.supaglue_customer_id,
                  originalId: supaglueDeal.supaglue_id,
                },
              });
              // delete relationships
              await tx.opportunityToContact.deleteMany({
                where: {
                  providerName: supaglueDeal.supaglue_provider_name,
                  customerId: supaglueDeal.supaglue_customer_id,
                  originalOpportunityId: supaglueDeal.supaglue_id,
                },
              });
            });
          } else {
            const mappedData = supaglueDeal.supaglue_mapped_data as Record<string, any>;
            const data = {
              providerName: supaglueDeal.supaglue_provider_name,
              customerId: supaglueDeal.supaglue_customer_id,
              originalId: supaglueDeal.supaglue_id,
              name: mappedData.dealname,
              amount: mappedData.amount ? parseInt(mappedData.amount) : null,
              lastModifiedAt: supaglueDeal.supaglue_last_modified_at,
            };

            // upsert relationships
            // TODO: we should have a standard way to get associations for
            // hubspot-like providers
            const rawData = supaglueDeal.supaglue_raw_data as Record<string, any>;
            const relatedOriginalContactIds = (rawData.associations?.contacts as string[] | undefined) ?? [];
            const uniqueRelatedOriginalContactIds = [...new Set(relatedOriginalContactIds)];

            await prisma.$transaction(async (tx) => {
              // upsert record
              await tx.opportunity.upsert({
                create: data,
                update: data,
                where: {
                  providerName_customerId_originalId: {
                    providerName: supaglueDeal.supaglue_provider_name,
                    customerId: supaglueDeal.supaglue_customer_id,
                    originalId: supaglueDeal.supaglue_id,
                  },
                },
              });
              await tx.opportunityToContact.deleteMany({
                where: {
                  originalOpportunityId: supaglueDeal.supaglue_id,
                  customerId: customer_id,
                  providerName: provider_name,
                },
              });

              await tx.opportunityToContact.createMany({
                data: uniqueRelatedOriginalContactIds.map((originalContactId) => ({
                  providerName: supaglueDeal.supaglue_provider_name,
                  customerId: supaglueDeal.supaglue_customer_id,
                  originalOpportunityId: supaglueDeal.supaglue_id,
                  originalContactId,
                  lastModifiedAt: supaglueDeal.supaglue_last_modified_at,
                })),
                skipDuplicates: true,
              });
            });
          }
        }

        return maxLastModifiedAtMs;
      });

      return newMaxLastModifiedAtMs;
    }
```

### Sync Contacts
```ts
    async function processContacts() {
      const newMaxLastModifiedAtMs = await step.run('Process hubspot contacts from supaglue', async () => {
        const supaglueContacts = await supagluePrisma.supaglueHubSpotContact.findMany({
          where: {
            supaglue_provider_name: data.provider_name,
            supaglue_customer_id: data.customer_id,
            supaglue_last_modified_at: {
              gt: lastMaxModifiedAt,
            },
          },
        });

        if (!supaglueContacts.length) {
          return undefined;
        }

        let maxLastModifiedAtMs = 0;

        // TODO: don't iterate one by one
        for (const supaglueContact of supaglueContacts) {
          const lastModifiedAtMs = supaglueContact.supaglue_last_modified_at.getTime();
          if (lastModifiedAtMs > maxLastModifiedAtMs) {
            maxLastModifiedAtMs = lastModifiedAtMs;
          }

          if (supaglueContact.supaglue_is_deleted) {
            await prisma.$transaction(async (tx) => {
              // delete record
              await tx.contact.deleteMany({
                where: {
                  providerName: supaglueContact.supaglue_provider_name,
                  customerId: supaglueContact.supaglue_customer_id,
                  originalId: supaglueContact.supaglue_id,
                },
              });
              // delete relationships
              await tx.opportunityToContact.deleteMany({
                where: {
                  providerName: supaglueContact.supaglue_provider_name,
                  customerId: supaglueContact.supaglue_customer_id,
                  originalContactId: supaglueContact.supaglue_id,
                },
              });
            });
            return maxLastModifiedAtMs;
          }
          const mappedData = supaglueContact.supaglue_mapped_data as Record<string, any>;
          const data = {
            providerName: supaglueContact.supaglue_provider_name,
            customerId: supaglueContact.supaglue_customer_id,
            originalId: supaglueContact.supaglue_id,
            firstName: mappedData.firstname,
            lastName: mappedData.lastname,
            email: mappedData.email,
            phone: mappedData.phone,
            lastModifiedAt: supaglueContact.supaglue_last_modified_at,
          };

          // upsert relationships
          // TODO: we should have a standard way to get associations for
          // hubspot-like providers
          const rawData = supaglueContact.supaglue_raw_data as Record<string, any>;
          const relatedOriginalDealIds = (rawData.associations?.deals as string[] | undefined) ?? [];
          const uniqueRelatedOriginalDealIds = [...new Set(relatedOriginalDealIds)];

          await prisma.$transaction(async (tx) => {
            // upsert record
            await tx.contact.upsert({
              create: data,
              update: data,
              where: {
                providerName_customerId_originalId: {
                  providerName: supaglueContact.supaglue_provider_name,
                  customerId: supaglueContact.supaglue_customer_id,
                  originalId: supaglueContact.supaglue_id,
                },
              },
            });

            await tx.opportunityToContact.deleteMany({
              where: {
                originalContactId: supaglueContact.supaglue_id,
                customerId: customer_id,
                providerName: provider_name,
              },
            });

            await tx.opportunityToContact.createMany({
              data: uniqueRelatedOriginalDealIds.map((originalDealId) => ({
                providerName: supaglueContact.supaglue_provider_name,
                customerId: supaglueContact.supaglue_customer_id,
                originalOpportunityId: originalDealId,
                originalContactId: supaglueContact.supaglue_id,
                lastModifiedAt: supaglueContact.supaglue_last_modified_at,
              })),
              skipDuplicates: true,
            });
          });
        }
        return maxLastModifiedAtMs;
      });

      return newMaxLastModifiedAtMs;
    }
```



### Reconciling the Bridge Table
```ts
      const relationships = await prisma.opportunityToContact.findMany({
        where: {
          AND: [
            {
              providerName: data.provider_name,
              customerId: data.customer_id,
              lastModifiedAt: {
                gt: lastMaxModifiedAt,
              },
            },
            {
              OR: [
                {
                  opportunityId: null,
                },
                {
                  contactId: null,
                },
              ],
            },
          ],
        },
      });

      if (!relationships.length) {
        return;
      }

      const uniqueOriginalOpportunityIds = [...new Set(relationships.map((r) => r.originalOpportunityId))];
      const uniqueOriginalContactIds = [...new Set(relationships.map((r) => r.originalContactId))];

      const opportunities = await prisma.opportunity.findMany({
        where: {
          providerName: data.provider_name,
          customerId: data.customer_id,
          originalId: {
            in: uniqueOriginalOpportunityIds,
          },
        },
        select: {
          id: true,
          originalId: true,
        },
      });
      const contacts = await prisma.contact.findMany({
        where: {
          providerName: data.provider_name,
          customerId: data.customer_id,
          originalId: {
            in: uniqueOriginalContactIds,
          },
        },
        select: {
          id: true,
          originalId: true,
        },
      });

      const opportunityIdByOriginalId = new Map<string, string>();
      for (const opportunity of opportunities) {
        opportunityIdByOriginalId.set(opportunity.originalId, opportunity.id);
      }
      const contactIdByOriginalId = new Map<string, string>();
      for (const contact of contacts) {
        contactIdByOriginalId.set(contact.originalId, contact.id);
      }

      for (const relationship of relationships) {
        const opportunityId = opportunityIdByOriginalId.get(relationship.originalOpportunityId);
        const contactId = contactIdByOriginalId.get(relationship.originalContactId);
        const res = await prisma.opportunityToContact.update({
          where: {
            providerName_customerId_originalOpportunityId_originalContactId: {
              providerName: provider_name,
              customerId: customer_id,
              originalOpportunityId: relationship.originalOpportunityId,
              originalContactId: relationship.originalContactId,
            },
          },
          data: {
            opportunityId: opportunityId ?? undefined,
            contactId: contactId ?? undefined,
          },
        });
      }
```
