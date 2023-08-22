# Object and field mapping

![platform](https://img.shields.io/badge/Platform%20Tutorial-009be5)

In this tutorial, we will use Supaglue to sync your customers' CRM records into your application with consistent schemas.

Even if user-1 uses HubSpot contacts, user-2 uses Salesforce Leads, and user-3 uses Salesforce Contacts, you'll be able to query that data in one consistent format in the database of your choice.

## Prerequisites

This tutorial assumes that you have already gone through Supaglue's [Quickstart](../../quickstart) and also set up Nextjs, Inngest, Prisma, and Postgres.

## Scenario

Suppose that your application has two entities:

- Contact
  - firstName
  - lastName
- Opportunity
  - name
  - description
  - probability

Furthermore, you have 3 customers, with ids `user-1`, `user-2`, and `user-3`. Each customer uses a different CRM, and may or may not have customized the data model of their CRM:

- `user-1` uses HubSpot contacts and deals.
- `user-2` uses Salesforce Leads and Opportunities, where they have customized the Opportunity data model to remove the `Probability` field and replace it with a `ProbabilityV2__c` field that is a picklist of values [10, 20, ..., 100].
- `user-3` uses Salesforce Contacts and Opportunities.

## Set up your Inngest Function

Now, you're ready to implement the Inngest Function that will be invoked whenever Supaglue issues a webhook event to signal that a sync has completed for a particular provider's object for a customer.

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

// Create an API that serves one function
export default serve(inngest, [transformedSyncedData]);
```

### Get the mapping configuration for this provider/customer/object

When a sync completes for a specific provider/customer/object, we need to figure out if that maps to a Contact or Opportunity entity in our application.

#### Create a mapper file

First, create a mapper file that contains the mapping configuration for each user's records to your entity schemas. For example:

```ts
// This user has normal HubSpot contact and deal objects.
const user1: UserConfig = {
  providerName: "hubspot",
  entityMappings: {
    contact: {
      object: "contact",
      mappingFn: (record: Record<string, string | null>): Contact => ({
        firstName: record["firstname"],
        lastName: record["lastname"],
      }),
    },
    opportunity: {
      object: "deal",
      mappingFn: (record: Record<string, string | null>): Opportunity => {
        const hs_deal_stage_probability = record["hs_deal_stage_probability"];
        const probability =
          hs_deal_stage_probability !== null
            ? parseFloat(hs_deal_stage_probability)
            : null;
        return {
          name: record["dealname"],
          description: record["description"],
          probability,
        };
      },
    },
  },
};

// This user uses Salesforce Lead and has a special Opportunity object with
// a ProbabilityV2__c field that is a picklist of values [10, 20, ..., 100].
const user2: UserConfig = {
  providerName: 'salesforce',
  entityMappings: {
    contact: {
      object: 'Lead',
      mappingFn: (record: Record<string, string>): Contact => ({
        firstName: record['FirstName'],
        lastName: record['LastName'],
      }),
    },
    opportunity: {
      object: 'Opportunity',
      mappingFn: (record: Record<string, string>): Opportunity => ({
        name: record['Name'],
        description: record['Description'],
        probability: parseInt(record['ProbabilityV2__c']) / 100,
      }),
    },
  }
};

// This user uses Salesforce Contact and has a normal Opportunity object.
const user3: UserConfig = {
  providerName: 'salesforce',
  entityMappings: {
    contact: {
      object: 'Contact',
      mappingFn: (record: Record<string, string>): Contact => ({
        firstName: record['FirstName'],
        lastName: record['LastName'],
      }),
    },
    opportunity: {
      object: 'Opportunity',
      mappingFn: (record: Record<string, string>): Opportunity => ({
        name: record['Name'],
        description: record['Description'],
        probability: parseFloat(record['Probability']) / 100,
      }),
    },
  }
}

const userConfigs: Record<string, UserConfig> = {
  'user-1': user1,
  'user-2': user2,
  'user-3': user3,
};

// this function can be called to get the mapper (Supaglue object record -> entity) for the given user
export const getMapper = (
  providerName: string,
  customerId: string,
  object: string
): MapperAny | null => {
  const config = userConfigs[customerId];
  if (!config) {
    return null;
  }

  if (config.providerName !== providerName) {
    return null;
  }

  // Find the corresponding entity name and mapper
  for (const [entityName, entityMappingConfig] of Object.entries(config.entityMappings)) {
    if (entityMappingConfig.object === object) {
      return {
        object,
        entityName,
        mappingFn: entityMappingConfig.mappingFn,
      } as MapperAny; // TODO: types
    }
  }
}
```

You could also evolve this sample code to create an object or field mapping UI for your customers to configure mappings into a DSL that you can then use at runtime (or to generate a mapper file).

#### Call the mapper file from your Inngest Function

Now, let's call the mapper file from your Inngest Function:

```ts
// For different customers, we want to map things differently
const mapper = getMapper(data.provider_name, data.customer_id, data.object);
if (!mapper) {
  return {
    event,
    body: "No mapper found for this provider/customer/object, so no action was taken.",
  };
}
```

### Paginate over newly-synced records

Now, we want to paginate over newly-synced records. Supaglue provides a `_supaglue_last_modified_at` timestamp field that represents the last time a record was modified in the upstream provider. Therefore, as long as we keep track of the maximum such value each time that our Inngest Function is invoked, we can then use the previous maximum value (hereafter refered to as "high watermark") to incrementally paginate over newly-synced records.

```ts
// Find high watermark for this sync
const lastMaxLastModifiedAtMs = await step.run(
  "Get high watermark",
  async () => {
    const state = await prismaApp.syncState.findUnique({
      where: {
        providerName_customerId_object: {
          providerName: data.provider_name,
          customerId: data.customer_id,
          object: data.object,
        },
      },
    });

    return state?.maxLastModifiedAt?.getTime();
  }
);
```

### Transform newly-synced records

Now, we want to transform the newly-synced records into our entity schemas. We'll use the mapper that we retrieved earlier to do this. Make sure to keep track of the maximum value of `_supaglue_last_modified_at` for the newly-synced records so that we can update the high watermark in the next step.

```ts
const lastMaxModifiedAt = lastMaxLastModifiedAtMs
  ? new Date(lastMaxLastModifiedAtMs)
  : undefined;

const newMaxLastModifiedAtMs = await step.run(
  "Update records",
  async () => {
    async function getSupaglueRecords(
      providerName: string,
      object: string
    ) {
      const params = {
        where: {
          supaglue_provider_name: data.provider_name,
          supaglue_customer_id: data.customer_id,
          supaglue_last_modified_at: {
            gt: lastMaxModifiedAt,
          },
        },
      };

      switch (providerName) {
        case "salesforce": {
          switch (object) {
            case "Contact":
              return prismaSupaglue.supaglueSalesforceContact.findMany(
                params
              );
            case "Lead":
              return prismaSupaglue.supaglueSalesforceLead.findMany(params);
            case "Opportunity":
              return prismaSupaglue.supaglueSalesforceOpportunity.findMany(
                params
              );
            default:
              throw new Error(`Unsupported Salesforce object: ${object}`);
          }
        }
        case "hubspot": {
          switch (object) {
            case "contact":
              return prismaSupaglue.supaglueHubSpotContact.findMany(params);
            case "deal":
              return prismaSupaglue.supaglueHubSpotDeal.findMany(params);
            default:
              throw new Error(`Unsupported HubSpot object: ${object}`);
          }
        }
        default:
          throw new Error(`Unsupported provider: ${providerName}`);
      }
    }

    // Read from staging table
    const records = await getSupaglueRecords(
      data.provider_name,
      data.object
    );
    if (!records.length) {
      return undefined;
    }

    let maxLastModifiedAtMs = 0;

    // TODO: don't iterate one by one
    for (const record of records) {
      const lastModifiedAtMs = record.supaglue_last_modified_at.getTime();
      if (lastModifiedAtMs > maxLastModifiedAtMs) {
        maxLastModifiedAtMs = lastModifiedAtMs;
      }

      if (record.supaglue_is_deleted) {
        // Delete
        const params = {
          where: {
            providerName: data.provider_name,
            customerId: data.customer_id,
            originalId: record.supaglue_id,
          },
        };

        switch (mapper.entityName) {
          case "contact":
            await prismaApp.contact.deleteMany(params);
            break;
          case "opportunity":
            await prismaApp.opportunity.deleteMany(params);
            break;
        }
      } else {
        // Upsert
        switch (mapper.entityName) {
          case "contact": {
            const mappedRecord = mapper.mappingFn(
              record.supaglue_mapped_data as Record<string, unknown>
            );
            const decoratedData = {
              providerName: data.provider_name,
              customerId: data.customer_id,
              originalId: record.supaglue_id,
              ...mappedRecord,
            };
            await prismaApp.contact.upsert({
              create: decoratedData,
              update: decoratedData,
              where: {
                providerName_customerId_originalId: {
                  providerName: data.provider_name,
                  customerId: data.customer_id,
                  originalId: record.supaglue_id,
                },
              },
            });
            break;
          }
          case "opportunity": {
            const mappedRecord = mapper.mappingFn(
              record.supaglue_mapped_data as Record<string, unknown>
            );
            const decoratedData = {
              providerName: data.provider_name,
              customerId: data.customer_id,
              originalId: record.supaglue_id,
              ...mappedRecord,
            };
            await prismaApp.opportunity.upsert({
              create: decoratedData,
              update: decoratedData,
              where: {
                providerName_customerId_originalId: {
                  providerName: data.provider_name,
                  customerId: data.customer_id,
                  originalId: record.supaglue_id,
                },
              },
            });
            break;
          }
        }
      }
    }

    return maxLastModifiedAtMs;
  }
);
```

### Update the high watermark

Finally, we want to update the high watermark for this provider/customer/object:

```ts
// record the high watermark seen
if (newMaxLastModifiedAtMs) {
  await step.run("Record high watermark", async () => {
    const state = {
      providerName: data.provider_name,
      customerId: data.customer_id,
      object: data.object,
      maxLastModifiedAt: newMaxLastModifiedAtMs
        ? new Date(newMaxLastModifiedAtMs)
        : undefined,
    };
    await prismaApp.syncState.upsert({
      create: state,
      update: state,
      where: {
        providerName_customerId_object: {
          providerName: data.provider_name,
          customerId: data.customer_id,
          object: data.object,
        },
      },
    });
  });
}

return {
  event,
  body: "Successfully copied updated records from staging into prod table",
};
```

## Test your Inngest Function

To test your Inngest Function, follow the steps in [Testing your Inngest Function](../../todo).

## Future Work

You'll want to customize the code from this tutorial to fit your specific application data model and use case.

In addition, the code as written is not optimized for performance; for example, it reads all of the records from Supaglue into memory and then paginates over them one by one while writing to the production database. For larger data volumes, this transformation may take a while to run, so you could consider batching instead.
