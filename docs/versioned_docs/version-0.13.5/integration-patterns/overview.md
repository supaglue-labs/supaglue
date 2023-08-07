import ThemedImage from '@theme/ThemedImage';

# Overview

<ThemedImage
alt="integration patterns overview"
width="50%"
sources={{
    light: '/img/integration-patterns-overview.png',
    dark: '/img/integration-patterns-overview.png',
  }}
/>

Supaglue supports three main integration patterns to access your customers' SaaS tools (aka third-party Providers):

1. [**Managed syncs (reads)**](./managed-syncs) - Fetch data from your customers' third-party Providers and land it in your database or data warehouse.
2. [**Actions API (writes)**](./actions-api) - Perform actions like create, update, delete, and multi-step workflows on your customers' third-party Providers.
3. [**Realtime events (triggers/cdc)**](./real-time-events) - Receive real-time notifications when data changes in your customers' third-party Providers to trigger actions in your application or use it to build a real-time mirror of your third-party Providers' data.

Read more about integration patterns [use cases here](../use-cases/overview).
