---
sidebar_position: 1
slug: /
---

# Introduction

## What is Supaglue?

Supaglue is a developer platform for integrating your application with your customer's Salesforce instance. It lets you authenticate with Salesforce, define integrations with code to sync SFDC sObjects, and expose customer-facing UI components in your application. Supaglue takes care of execution, fault-tolerance, and communicating with customer's Salesforce. Supaglue is open source and can be self-hosted to run alongside your stack.

:::caution

Supaglue is in Public Alpha. There are currently many missing features, interfaces will likely change, and it is not production-ready yet.

:::

## What it isn't

Supaglue is not a no-code tool. While there are no-code tools that also help companies integrate with their customers' Salesforce, we take a code-centric approach to integrations and are focused exclusively on developers.

Supaglue is also not a unified API for interacting with many CRMs. Whereas unified APIs help developers efficiently build integrations within a single category, we enable developers to build deeper Salesforce integrations that could otherwise only be built in-house.

## Features

- **Integration as code**: Use Typescript as declarative configuration to define syncs.
- **Managed syncs**: Let Supaglue execute syncs for you with fault-tolerance, retries, rate limiting, and error handling.
- **Managed OAuth**: Offload OAuth flows, storing & refreshing tokens to Supaglue
- **Embeddable UI components**: Customer-facing React components that let your customers configure syncs. Fully-functional and customizable.
- **Prebuilt sync templates**: Use ready-made sync templates or customize them to your use case.
- **Open source**: Self-host Supaglue or extend it. Sensitive customer data never leaves your cloud.

## How it works

Supaglue is a set of open-source components to let developers build integrations in their applications with their customers' Salesforce using code, quickly and extensibly.

import ThemedImage from '@theme/ThemedImage';

<ThemedImage
alt="Intro Diagram"
sources={{
    light: ('/img/intro_diagram_light.png'),
    dark: ('/img/intro_diagram_dark.png'),
  }}
/>

- **Config SDK** to define [syncs](./concepts#developer-config) declaratively
- **CLI** to publish sync configuration changes
- **API** to communicate an coordinate with your application, Salesforce, and Supaglue
- **Workflow engine (Temporal)** to reliably execute [syncs](./concepts#sync)
- **Database** to store developer and customer configurations and credentials
- **React components (Nextjs SDK)** to embed customer-facing UI into your application

## Use cases

Supaglue can be used by B2B SaaS companies to provide customer-facing Salesforce integrations as part of their products.

- Sync Salesforce standard objects into your application's Postgres database, where your customers customize field mappings using a UI component
- Consume Salesforce standard objects via a webhook, transform the payload, and call multiple backend systems before writing it to a data store

## Roadmap & Vision

Read more about where Supaglue is headed [here](./roadmap).

## Status

- [x] **Private Alpha**: Testing Supaglue with a closed set of developers
- [x] **Public Alpha**: Anyone can run Supaglue locally using Docker. Go easy on us! We're working on substantial improvements.
- [ ] **Public Beta**: Stable and feature-rich enough to implement in production
- [ ] **Public**: Production-ready for majority of integration use cases with Salesforce

We are currently in Public Alpha. Watch releases of [this repo](https://github.com/supaglue-labs/supaglue) to be notified of significant updates (as minor semver releases).

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/v0.1.1-1/LICENSE).
