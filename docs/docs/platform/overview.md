---
description: ''
sidebar_position: 1
---

import ThemedImage from '@theme/ThemedImage';

# Overview

<ThemedImage
alt="managed auth"
width="85%"
sources={{
    light: '/img/platform-overview-diagram.png',
    dark: '/img/platform-overview-diagram.png',
  }}
/>

Supaglue offers several platform features to support a diverse range of integrations.

## Authentication

Underlying everything is **[Managed Authentication](./managed-auth)**. We let your customers authenticate with various Providers using different authentication strategies (Oauth2, API key, access tokens), securely store the secrets, and maintain the authenticated sessions (refresh and access tokens for Oauth2).

## Syncing and writing

There are two core access patterns when using Supaglue:

1. **Managed Syncs**: Syncing data from Providers to a database Destination in your cloud. Managed Syncs allows you to query third-party Provider data in your infrastructure.
2. **Actions API**: Writing real-time data synchronously to Providers using modern HTTP APIs.

Both access patterns operate on objects (lowercase objects).

## Data modeling

There are three ways to data model objects in Supaglue:

1. **[Entities](./entities/overview)**: You, the developer, define the data models.
2. **[Objects](./objects/overview)**: Let you take the Provider's data model as-is.
3. **[Common Schema](./common-schema/overview)**: Lets Supaglue define the data model.

Which data model you choose to adopt is based on the [integration patterns](../integration-patterns/overview) you are building into your product.

## Metadata APIs

**[Metadata APIs](./metadata)** get used regardless of whether it's for syncing, writing, or how you data model objects. Examples of this include:

- Properties API: Get all objects and fields available for a Provider.
- Custom Objects API: Define and create custom objects for a Provider.
- Get the schema definition for a Provider object.

## Passthrough APIs

The platform features above help accelerate development time for integrations and aim at covering 80% of the most frequently occurring use cases, but they don't cover them all. For the remaining 20%, we expose **[Passthrough APIs](passthrough)** that allow you to call the underlying Provider's native APIs.
