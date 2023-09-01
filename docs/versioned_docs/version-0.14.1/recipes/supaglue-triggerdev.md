import ThemedImage from '@theme/ThemedImage';

# Supaglue + Trigger.dev

In many situations, you will not [read directly](../integration-patterns/managed-syncs#query-patterns) from the raw data that Supaglue lands into a database, e.g. when you already have an application data model (contact and account tables in your production database).

Instead, you will want to transform and enrich that data into more convenient models for your application using a transformation pipeline. Depending on your reliability requirements, you may wish to implement queueing, retries, and handling other scenarios for fault tolerance. Instead of building that infrastructure from scratch, you can leverage existing workflow engines like Trigger.dev.

## Go end-to-end

Go through the following tutorials to build an end-to-end integration using Supaglue and Trigger.dev:

1. Go through [Supaglue's Quickstart](../quickstart) (approximately 10 minutes)
2. Go through [Trigger.dev's Quickstart](https://trigger.dev/docs/documentation/quickstarts/nextjs)
3. Refer to our [Transformations Tutorials](../category/transformations) for implementing common patterns for converting raw third-party provider data into your tables

<ThemedImage
alt="trigger.dev"
width="75%"
sources={{
    light: '/img/triggerdev.png',
    dark: '/img/triggerdev.png',
  }}
/>

## Examples

- Common schema [example](https://github.com/supaglue-labs/common-model-example)
- Association bridge table [example](https://github.com/supaglue-labs/associations-bridge-table-example)
- Object and field mapping [example](https://github.com/supaglue-labs/object-field-mapping-example)
