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

1. **Managed syncs (reads)**: Syncing data from providers to a database Destination in your cloud. Managed Syncs allows you to query third-party Provider data in your infrastructure.
2. **Passthrough API (writes)**: Write real-time data synchronously to Providers using underlying native APIs.

### Transformations

Both access patterns operate on objects.

## Metadata APIs

Metadata APIs get used regardless of whether it's for syncing, writing, or how you data model objects. Examples of this include:

- Properties API: Get all objects and fields available for a Provider.
- Custom Objects API: Define and create custom objects for a Provider.
- Get the schema definition for a Provider object.

## Passthrough APIs

The platform features above help accelerate development time for integrations and aim at covering 80% of the most frequently occurring use cases, but they don't cover them all. For the remaining 20%, we expose **[Passthrough APIs](./passthrough)** that allow you to call the underlying Provider's native APIs.
