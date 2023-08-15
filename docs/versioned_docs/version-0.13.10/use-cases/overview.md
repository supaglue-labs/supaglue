import ThemedImage from '@theme/ThemedImage';

# Use cases

Pick and choose the [platform features](../platform/overview) that best suit your use case. Here are some common combinations when using platform features:

### Pattern #1 - Run analytics on customer data from a single Provider

<ThemedImage
alt="integration pattern 1"
width="50%"
sources={{
    light: '/img/integration-pattern-1.png',
    dark: '/img/integration-pattern-1.png',
  }}
/>

Platform features:

- [Managed Syncs](../integration-patterns/managed-syncs)
- Data model using [Objects](../platform/objects/overview)
- Use an analytical data warehouse Destination (BigQuery, S3, Snowflake, Redshift)

Example:

- You want to sync calls and call transcript data from Gong into BigQuery to surface insights to customers.

### Pattern #2 - Unify your data model across Providers for reads/writes

<ThemedImage
alt="integration pattern 2"
width="50%"
sources={{
    light: '/img/integration-pattern-2.png',
    dark: '/img/integration-pattern-2.png',
  }}
/>

Platform features:

- [Managed Syncs](../integration-patterns/managed-syncs)
- [Actions API](../integration-patterns/actions-api)
- Data model using [Entities](../platform/entities/overview)
- Use an application database Destination (Postgres, MySQL, MongoDB)

Example:

- You are building a sales prospecting tool that needs data from different customer CRMs to surface in your application. You want to write back pipeline stage information and create contacts in their CRM.

### Pattern #3 - Write to fields on common Providers and objects

<ThemedImage
alt="integration pattern 3"
width="50%"
sources={{
    light: '/img/integration-pattern-3.png',
    dark: '/img/integration-pattern-3.png',
  }}
/>

Platform features:

- [Actions API](../integration-patterns/actions-api)
- Data model using [Common Schema](../platform/common-schema/overview)

Example:

- You already have Snowflake, where you centralize customer data, but you want to write a lead score for your customers' different CRM accounts.

### Many integration patterns

There are many ways to integrate with your customers' third-party tools using Supaglue's platform features.
