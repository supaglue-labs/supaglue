---
sidebar_position: 1
slug: /
---

# Introduction

## What is Supaglue?

Supaglue is a developer platform for integrating your application with your customer's Salesforce instance. It lets you authenticate with Salesforce, define integrations with code to sync SFDC sObjects, and expose customer-facing UI components in your application. Supaglue takes care of execution, fault-tolerance, and communicating with customer's Salesforce. Supaglue is open source and can be self-hosted.

:::caution

Supaglue is in Public Alpha. There are currently many missing features, interfaces will likely change, and it is not production-ready yet.

:::

<p align="center">
  <a href="#"><img src="/img/diagram2.png" alt="Supaglue" width="600px"/></a>
</p>

## What it isn't

Supaglue is not a no-code tool. While there are no-code tools that also help companies integrate with their customers' Salesforce, we take a code-centric approach to integrations and are focused exclusively on developers.

Supaglue is also not a unified API. Whereas unified APIs help developers efficiently integrate many different SaaS tools within a single category, we enable developers to build deep, highly-customized Salesforce integrations that could otherwise only be built in-house.

Notably, Supaglue is designed to be highly customizable and extensible on both the front-end and backend. Our goal is to give developers tools to ship most integration use cases quickly, without sacrificing the fine-grain control required for advanced use cases.

## Features

- **Integration as code**: Use Typescript as declarative configuration to define syncs.
- **Managed syncs**: Let Supaglue execute syncs for you with fault-tolerance, retries, rate limiting, and error handling.
- **Managed OAuth**: Offload OAuth flows, storing & refreshing tokens to Supaglue
- **Embeddable UI components**: Customer-facing React components that let your customers configure syncs. Fully-functional and customizable.
- **Prebuilt sync templates**: Use ready-made sync templates or customize them to your use case.
- **Open source**: Self-host Supaglue or extend it. Sensitive customer data never leaves your cloud.

## How it works

Supaglue is a set of open-source components to let developers build integrations in their applications with their customers' Salesforce using code, quickly and extensibly.

- **Typescript sync configuration** to define declaratively [syncs](/concepts/sync)
- **CLI** to publish configuration changes
- **API** to accept requests from your application, Salesforce, and the CLI
- **Workflow engine (Temporal)** to reliably execute [syncs](/concepts/sync)
- **Database** to store developer and customer configurations
- **React components** to embed customer-facing UI into your application

## Use cases

:::info

Supaglue's current feature set is limited to syncing Salesforce sObjects to your application.

:::

Supaglue can be used by marketing/sales automation and sales enablement tools that provide customer-facing Salesforce integrations as part of their products.

- Sync Salesforce Contacts into your Postgres applications database, where your customers customize field mappings using a UI component
- Consume Salesforce Opportunities records via a webhook, transform the payload, and call multiple backend systems before writing it to a data store

## Roadmap & Vision

Read more about where Supaglue is headed [here](/roadmap).

## Status

- [x] **Private Alpha**: Testing Supaglue with a closed set of developers
- [x] **Public Alpha**: Anyone can run Supaglue locally using Docker. Go easy on us! We're working on substantial improvements.
- [ ] **Public Beta**: Stable and feature-rich enough to implement in production
- [ ] **Public**: Production-ready for majority of integration use cases with Salesforce

We are currently in Public Alpha. Watch releases of [this repo](https://github.com/supaglue-labs/supaglue) to be notified of significant updates (as minor semver releases).

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
