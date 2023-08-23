import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Association Bridge Table (Hubspot)

This tutorial will show how to land a bridge table in your using Supaglue and Inngest for associating Hubspot Contacts and Deals.

## Prerequisites

This tutorial assumes you have gone through Supaglue's [Quickstart](../../quickstart), created a [Hubspot integration](../../providers/hubspot), completed the [Webhooks tutorial](../listen-for-webhooks), and will use the following technologies:

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

1. Listen for Supaglue's `sync.complete` webhook event to trigger a workflow
2. Write Supaglue's data into 3 tables:
  a. `Contacts` table containing transformed Hubspot Contacts data
  b. `Deals` table containing transformed Hubspot Deals data
  c. `ContactToDealsLink` table which acts as a bridge table foe the many-to-many relationship
3. (optional) Reconcile the bridge table entries to enable Foreign Keys from `ContactToDealsLink` to `Contacts` and `Deals` tables


The bridge table will contain the following columns:
  - `customer_id`: The unique ID for the customer whose data you are syncing
  - `provider_name`: The provider name (`hubspot`, in thise case)
  - `supaglue_contact_id`: The original ID for the contact as assigned by Supaglue
  - `supaglue_deal_id`: The original ID for the deal as assigned by Supaglue
  - `contact_id`: The ID your application has assigned to this contact, used as a Foreign Key to the `contacts` table
      - If the contact does not exist in the `contacts` table, it will be kept as a `NULL`
  - `deal_id`: The ID your application has assigned to this deal, used as a Foreign Key to the `deals` table
      - If the deal does not exist in the `deals` table, it will be kept as a `NULL`
  - `last_modified_at`: The timestamp at which this row was last modified
  
The bridge table will have:
  - Unique constraint on [`customer_id`, `provider_name`, `supaglue_contact_id`, `supaglue_deal_id`]
  - Unique constraint on [`contact_id`, `deal_id`]

## Set up your Inngest Function

### 1. Listen for Supaglue's webhook event

Supaglue emits different kinds of notification webhooks. For object and field mapping, we want to process the `sync.complete` event which is emitted after a full or incremental sync has completed.

```ts
export async function POST(request: NextRequest) {
  const data = await request.json();

  if (data.webhook_event_type !== 'sync.complete') {
    return NextResponse.json({});
  }

  if (data.result !== 'SUCCESS') {
    return NextResponse.json({});
  }

  // call your webhook handler here

  return NextResponse.json({});
}
```

### 2. Syncing Contacts and Deals

<Tabs>

<TabItem value="algorithm" label="Algorithm" default>

Upon a `sync.complete` webhook event:

1. Read all object records since last high watermark
2. For each record, apply any transformations you may want
3. Upsert the transformed record into your database table
4. Upsert any bridge table entries (i.e. Contact <-> Deal relationships) as necessary
5. Set the new high watermark

</TabItem>

<TabItem value="contacts-code" label="Example Code (Contacts)" default>

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
                  supaglueId: supaglueContact.supaglue_id,
                },
              });
              // delete relationships
              await tx.dealToContact.deleteMany({
                where: {
                  providerName: supaglueContact.supaglue_provider_name,
                  customerId: supaglueContact.supaglue_customer_id,
                  supaglueContactId: supaglueContact.supaglue_id,
                },
              });
            });
            return maxLastModifiedAtMs;
          }
          const mappedData = supaglueContact.supaglue_mapped_data as Record<string, any>;
          const data = {
            providerName: supaglueContact.supaglue_provider_name,
            customerId: supaglueContact.supaglue_customer_id,
            supaglueId: supaglueContact.supaglue_id,
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
          const relatedSupaglueDealIds = (rawData.associations?.deals as string[] | undefined) ?? [];
          const uniqueRelatedSupaglueDealIds = [...new Set(relatedSupaglueDealIds)];

          await prisma.$transaction(async (tx) => {
            // upsert record
            await tx.contact.upsert({
              create: data,
              update: data,
              where: {
                providerName_customerId_supaglueId: {
                  providerName: supaglueContact.supaglue_provider_name,
                  customerId: supaglueContact.supaglue_customer_id,
                  supaglueId: supaglueContact.supaglue_id,
                },
              },
            });

            await tx.dealToContact.deleteMany({
              where: {
                supaglueContactId: supaglueContact.supaglue_id,
                customerId: customer_id,
                providerName: provider_name,
              },
            });

            await tx.dealToContact.createMany({
              data: uniqueRelatedSupaglueDealIds.map((supaglueDealId) => ({
                providerName: supaglueContact.supaglue_provider_name,
                customerId: supaglueContact.supaglue_customer_id,
                supaglueDealId: supaglueDealId,
                supaglueContactId: supaglueContact.supaglue_id,
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

</TabItem>
<TabItem value="" label="Example Code (Deals)" default>

```ts
    async function processDeals() {
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
              await tx.deal.deleteMany({
                where: {
                  providerName: supaglueDeal.supaglue_provider_name,
                  customerId: supaglueDeal.supaglue_customer_id,
                  supaglueId: supaglueDeal.supaglue_id,
                },
              });
              // delete relationships
              await tx.dealToContact.deleteMany({
                where: {
                  providerName: supaglueDeal.supaglue_provider_name,
                  customerId: supaglueDeal.supaglue_customer_id,
                  supaglueDealId: supaglueDeal.supaglue_id,
                },
              });
            });
          } else {
            const mappedData = supaglueDeal.supaglue_mapped_data as Record<string, any>;
            const data = {
              providerName: supaglueDeal.supaglue_provider_name,
              customerId: supaglueDeal.supaglue_customer_id,
              supaglueId: supaglueDeal.supaglue_id,
              name: mappedData.dealname,
              amount: mappedData.amount ? parseInt(mappedData.amount) : null,
              lastModifiedAt: supaglueDeal.supaglue_last_modified_at,
            };

            // upsert relationships
            // TODO: we should have a standard way to get associations for
            // hubspot-like providers
            const rawData = supaglueDeal.supaglue_raw_data as Record<string, any>;
            const relatedSupaglueContactIds = (rawData.associations?.contacts as string[] | undefined) ?? [];
            const uniqueRelatedSupaglueContactIds = [...new Set(relatedSupaglueContactIds)];

            await prisma.$transaction(async (tx) => {
              // upsert record
              await tx.deal.upsert({
                create: data,
                update: data,
                where: {
                  providerName_customerId_supaglueId: {
                    providerName: supaglueDeal.supaglue_provider_name,
                    customerId: supaglueDeal.supaglue_customer_id,
                    supaglueId: supaglueDeal.supaglue_id,
                  },
                },
              });
              await tx.dealToContact.deleteMany({
                where: {
                  supaglueDealId: supaglueDeal.supaglue_id,
                  customerId: customer_id,
                  providerName: provider_name,
                },
              });

              await tx.dealToContact.createMany({
                data: uniqueRelatedSupaglueContactIds.map((supaglueContactId) => ({
                  providerName: supaglueDeal.supaglue_provider_name,
                  customerId: supaglueDeal.supaglue_customer_id,
                  supaglueDealId: supaglueDeal.supaglue_id,
                  supaglueContactId,
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
</TabItem>
</Tabs>



### 3. Reconciling the Bridge Table

In some cases, you may want to only have an entry in the Bridge Table if and only if both sides of the relationship exists (i.e. if you want a Foreign Key from the bridge table to either side of the object tables). Because the Contact and Deal syncs happen asynchronously, there may be cases where there is a Contact with relationships to a Deal that has not yet been synced.

To deal with this, there may need to be a reconciliation step where you first write the bridge table entries (as you did in the previous step), and then validate those entries if and only if both sides of the relationship exists in the primary object tables you have written to.

In our example, the bridge table consists of:
- `supaglue_contact_id` / `supaglue_deal_id`: These are the non-nullable columns we wrote to in the previous step.
- `contact_id` / `deal_id`: These are foreign key columns that reference the primary keys of the `Contact` and `Deal` tables respectively.
  - They may or may not occupy the same namespace as `supaglue_contact_id` / `supaglue_deal_id` depending on your data model design.

<Tabs>

<TabItem value="Algorithm" label="Algorithm" default>

Immediately after the previous step (i.e. syncing both objects and the initial bridge table entry):

1. Find all entries in the bridge table for which `contact_id` or `deal_id` is NULL. Grab the corresponding `supaglue_contact_id` and/or `supaglue_deal_id`.
2. See if the `contact` and/or `deal` exists that corresponds to the `supaglue_contact_id` / `supaglue_deal_id`. 
3. If so, write the `contact_id` / `deal_id` for those objects into the bridge table entry.

</TabItem>

<TabItem value="example-code" label="Example Code" default>

```ts
    async function reconcileAssociations() {
      const relationships = await prisma.dealToContact.findMany({
        where: {
          AND: [
            {
              providerName: data.provider_name,
              customerId: data.customer_id,
            },
            {
              OR: [
                {
                  dealId: null,
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

      const uniqueSupaglueDealIds = [...new Set(relationships.map((r) => r.supaglueDealId))];
      const uniqueSupaglueContactIds = [...new Set(relationships.map((r) => r.supaglueContactId))];

      const deals = await prisma.deal.findMany({
        where: {
          providerName: data.provider_name,
          customerId: data.customer_id,
          supaglueId: {
            in: uniqueSupaglueDealIds,
          },
        },
        select: {
          id: true,
          supaglueId: true,
        },
      });
      const contacts = await prisma.contact.findMany({
        where: {
          providerName: data.provider_name,
          customerId: data.customer_id,
          supaglueId: {
            in: uniqueSupaglueContactIds,
          },
        },
        select: {
          id: true,
          supaglueId: true,
        },
      });

      const dealIdBySupaglueId = new Map<string, string>();
      for (const deal of deals) {
        dealIdBySupaglueId.set(deal.supaglueId, deal.id);
      }
      const contactIdBySupaglueId = new Map<string, string>();
      for (const contact of contacts) {
        contactIdBySupaglueId.set(contact.supaglueId, contact.id);
      }

      for (const relationship of relationships) {
        const dealId = dealIdBySupaglueId.get(relationship.supaglueDealId);
        const contactId = contactIdBySupaglueId.get(relationship.supaglueContactId);
        const res = await prisma.dealToContact.update({
          where: {
            providerName_customerId_supaglueDealId_supaglueContactId: {
              providerName: provider_name,
              customerId: customer_id,
              supaglueDealId: relationship.supaglueDealId,
              supaglueContactId: relationship.supaglueContactId,
            },
          },
          data: {
            dealId: dealId ?? undefined,
            contactId: contactId ?? undefined,
          },
        });
      }
    }
```

</TabItem>

</Tabs>

## More information

You can try out a working example of this tutorial by cloning the supaglue-associations repository and following the instructions in the README.

You'll want to customize the code from this tutorial to fit your specific application data model, use case, performance, and reliability requirements.
