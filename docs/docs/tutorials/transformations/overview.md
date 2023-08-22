import ThemedImage from '@theme/ThemedImage';

# Overview

<ThemedImage
alt="transform step diagram"
width="20%"
sources={{
    light: '/img/transform-step-diagram.png',
    dark: '/img/transform-step-diagram.png',
  }}
/>

At a high level, integrating with third-party SaaS tools involves three steps:

1. Syncing data
2. **Transforming data**
3. Querying data

The tutorials here cover the second step: transformations. We will cover tutorials for common transformations and provide reference code you can run and use to get started with your application.

## Types of transformations

You will likely want to run different transformations on the raw data that Supaglue syncs. The types of transformations range from simple ones (like renaming fields) to complex ones (like fetching data from external resources). Below are common transformations:

- Implementing a [common schema](./common-schema)
- [Normalizing relationships](./normalized-relations) between objects
- [Object and field mapping](./object-field-mapping) for different customers and providers
- [Mapping values](./value-mapping)
- Converting between formats (like [date time formats](./date-time-conversion.md))

## Triggering and running transformations

Use [notification webhooks](../../platform/notification-webhooks) to trigger transformations on sync completion.

<ThemedImage
alt="transformation steps"
width="75%"
sources={{
    light: '/img/transformation-steps.png',
    dark: '/img/transformation-steps.png',
  }}
/>

We wrote a [Listen for webhooks](../listen-for-webhooks) tutorial that goes more in-depth. You can also follow one of our [Recipes](../../recipes/overview) for pairing your Nextjs or Typescript app with a workflow engine to build a reliable transformation pipeline:

- [Nextjs + Inngest](../../recipes/nextjs-inngest)
- [Nextjs + Trigger.dev](../../recipes/nextjs-triggerdev)
- [Expressjs + Temporal](../../recipes/expressjs-temporal)
- More to come...
