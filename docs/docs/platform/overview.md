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

Underlying everything is **[Managed Authentication](./managed-auth)**. We let your customers authenticate with dozens of Providers using different authentication strategies (OAuth2, API key, access token), securely store the secrets, and maintain the authenticated sessions (refresh and access tokens for OAuth2).

## Reading & writing data

There are two core access patterns when using Supaglue:

1. **Reads:**
   - [**Managed syncs**](../integration-patterns/managed-syncs) - Supaglue will land raw data in a database. You can choose between your database or a Supaglue-hosted database as a Destination.
   - [**Data Listing API**](../api/v2/data/data-api) - Paginate through raw third-party data and transform it to your database schema.
   - **Unified API** - Read from multiple third-party providers with a single API for [`crm`](../api/v2/crm/unified-crm-api, [`engagement`](../api/v2/engagement/unified-engagement-api), or [`enrichment`](../api/v2/enrichment/unified-enrichment-api).
2. **Writes:**
   - **Unified API** - Write to multiple third-party providers with a single API for [`crm`](../api/v2/crm/unified-crm-api) and [`engagement`](../api/v2/engagement/unified-engagement-api).
   - [**Actions API**](../api/v2/actions/actions-api) - Write to provider-scoped APIs that range from CRUD to complex actions.
   - [**Passthrough API**](../platform/passthrough) - Use the underlying Provider's native API to write data back to their systems.
3. **Triggers/CDC:** [**Realtime events**](../integration-patterns/real-time-events) - Receive real-time notifications when data changes in your customers' third-party Providers to trigger actions in your application or use it to build a real-time mirror of your third-party Providers' data.

## Notification webhooks

Supaglue [notification webhooks](./notification-webhooks) are HTTP requests that Supaglue sends to your API endpoint to notify you of important events like syncs completing, errors occurring, and more.

Your integration can listen for these webhooks to do the following:

- Alert on sync errors
- Transform synced data for your application
- Cleanup old data after a customer deletes their account or disconnects their integration
- Backfill data after a customer changes configuration settings

## Passthrough APIs

The platform features above help accelerate development time for integrations and aim at covering 80% of the most frequently occurring use cases, but they don't cover them all. For the remaining 20%, we expose **[Passthrough APIs](./passthrough)** that allow you to call the underlying Provider's native APIs.
