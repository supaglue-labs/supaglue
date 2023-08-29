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

1. **Reads:** [**Managed syncs**](./managed-syncs) - Supaglue will land data in a database. You can choose between your database or a Supaglue-hosted database as a Destination.
2. **Writes:** [**Passthrough API**](../platform/passthrough) - Use the underlying Provider's native API to write data back to their systems.
3. **Triggers/CDC:** [**Realtime events**](./real-time-events) - Receive real-time notifications when data changes in your customers' third-party Providers to trigger actions in your application or use it to build a real-time mirror of your third-party Providers' data.

Read more about integration patterns [use cases here](../use-cases/overview).
