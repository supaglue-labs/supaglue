import ThemedImage from '@theme/ThemedImage';

# Overview

Supaglue is designed to support a diverse range of product integration use cases.

<ThemedImage
alt="managed auth"
width="50%"
sources={{
    light: '/img/platform-overview-diagram.png',
    dark: '/img/platform-overview-diagram.png',
  }}
/>

## Authentication

Underlying everything on the Supaglue platform is **[Managed Authentication](./managed-auth)**. We let your customers authenticate with dozens of Providers using different authentication strategies (OAuth2, API key, access token), securely store the secrets, and maintain the authenticated sessions (refresh and access tokens for OAuth2).

## Reads & writes

For **reading** and **writing** data, Supaglue provides [Unified APIs](../integration-patterns/unified-api) which provide a single API interface across multiple providers.

For convenience, Supaglue also offers managed Syncs for **reading** data from Providers and syncing it to destinations such as Postgres and analytical data warehouses like BigQuery. Managed Syncs operate on [Standard and Custom Objects](./objects/overview) as well as [Common Objects](./common-schemas/overview).

## Passthrough APIs

The platform features above help accelerate development time for integrations and aim at covering 80% of the most common use cases. For the remaining 20%, we expose **[Passthrough APIs](./passthrough)** that allow you to call the underlying Provider's native APIs.

## Notification webhooks

Supaglue [notification webhooks](./notification-webhooks) are HTTP requests that we send to your API endpoint to notify you of important events like completed syncs, new connections, errors, and more.