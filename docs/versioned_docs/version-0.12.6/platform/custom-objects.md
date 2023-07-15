---
description: ''
---

# Custom objects

Supaglue provides all the tools you need to manage custom objects in your customers' SaaS tools:

- ability to manage custom objects and associations
- ability to sync objects and associations from SaaS tools into the data store of your choice

## Managing custom objects and associations

Managing custom objects and associations in various SaaS tools is difficult. For example, while HubSpot manages associations with a separate Associations API, Salesforce just allows you to set them directly on the record.

Managing these different workflows is time-consuming and error-prone as you support more and more SaaS tools.

Supaglue's Custom Objects API is a unified API that allows you to:

- create custom objects,
- create custom object records,
- create association types between objects, and
- create associations between records.

## Example

Suppose that you want to store information about competitors that are relevant to a particular Salesforce Opportunity. You could use Supaglue's Custom Objects API to do the following:

1. Create a custom object called `Competitor Info`.
1. Create a association type between `Opportunity` and `Competitor Info`.
1. Whenever a new `Opportunity` record is created, find an existing `Competitor Info` record, or create a new one, and associate it with the `Opportunity` record.

## Syncing objects and associations

Any records and associations that you create via Supaglue's Custom Objects API, as well as any records created in the SaaS tool, can be synced into the data store of your choice.

Refer to our [docs on syncing standard and custom objects](../integration-patterns/managed-syncs#standard-and-custom-objects) for more information.
