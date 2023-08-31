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

## Reading & writing data

Once authenticated we provide Managed Syncs for reading data from Providers and syncing it to Destinations. Managed Syncs operate on [Objects](./objects/overview).

For reading and writing data, we have the [Actions API](../integration-patterns/actions-api) which are helpful APIs scoped to a single provider and [Unified APIs](../integration-patterns/unified-api) which provide a single API interface across multiple providers.

## Passthrough APIs

The platform features above help accelerate development time for integrations and aim at covering 80% of the most frequently occurring use cases, but they don't cover them all. For the remaining 20%, we expose **[Passthrough APIs](./passthrough)** that allow you to call the underlying Provider's native APIs.

## Notification webhooks

Supaglue [notification webhooks](./notification-webhooks) are HTTP requests that Supaglue sends to your API endpoint to notify you of important events like syncs completing, errors occurring, and more.

Your integration can listen for these webhooks to do the following:

- Alert on sync errors
- Transform synced data for your application
- Cleanup old data after a customer deletes their account or disconnects their integration
- Backfill data after a customer changes configuration settings
