---
sidebar_position: 1
slug: /
---

# Introduction

## What is Supaglue?

Supaglue is an open source unified API for CRMs. It handles authentication, caches and normalizes data from multiple CRM platforms, and provides a single set of API endpoints for reading and writing to those CRMs. Developers at B2B companies can use Supaglue to streamline and scale the work of building customer-facing CRM integrations. Supaglue can be self-hosted and runs alongside your stack.

<figure>

![supaglue-quickstart](/img/quickstart.gif)

<figcaption>10 seconds: Stand up Supaglue and fetch Salesforce or Hubspot accounts using a unified API</figcaption>
</figure>

## Features

- **Unified API**: single developer interface to read from and write to multiple third-party providers.
- **Common model**: a common data model for CRMs that has been standardized across multiple third-party providers.
- **High performance**: query against synced data in your own cloud with no rate limits.
- **Open source**: self-host and run Supaglue for free.
- **Privacy-first**: prevent sensitive customer data from leaving your infrastructure.
- **BYO-connectors**: extend Supaglue with your own connectors.
- **Developer-centric**: self-host multiple instances for local, staging, and production environments.
- **Monitoring and logs**: monitor the status of syncs and stream logs to your cloud.

## Connectors

- HubSpot
- Salesforce

Supported common objects: Accounts, Contacts, Leads, Opportunities.

Looking for more connectors or objects? Reach out to us! [support@supaglue.com](mailto:support@supaglue.com)

## How it works

When developers at B2B companies integrate with Supaglue, they are able to provide many CRM integrations to their customers. Supaglue enables those customers to authenticate with their CRM, and reliably sync data from those customers' CRMs into Supaglue's database. The data is mapped to a common data model and exposed through a unified REST API that provides developers read/write access to their customers' CRMs. Supaglue is a separate service that runs alongside your stack. Supaglue is open source and can be self-hosted.

Supaglue consists of the following components:

- Managed authentication
- Sync engine
- Postgres database
- Common data model
- REST API

## Use cases

- Ingest Contact and Account data from HubSpot and Salesforce into your B2B SaaS application.
- Enrich your customers' CRMs with additional data from your product.

## Roadmap & vision

Read more about where Supaglue is headed [here](/roadmap).

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
