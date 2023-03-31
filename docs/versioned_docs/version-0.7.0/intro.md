---
sidebar_position: 1
slug: /
---

# Introduction

## What is Supaglue?

Supaglue is an open source unified API for CRMs. It handles authentication, caches and normalizes data from multiple CRM platforms, and provides a single set of API endpoints for reading and writing to those CRMs. Developers at B2B companies can use Supaglue to streamline and scale the work of building customer-facing CRM integrations.

<figure>

![supaglue-quickstart](/img/social_img.png)

</figure>

## Features

- **Unified API**: single developer interface to read from and write to multiple third-party providers.
- **Common model**: a common data model for CRMs that has been standardized across multiple third-party providers.
- **High performance**: query against synced data in your own cloud with no rate limits.
- **Open source**: self-host and run Supaglue for free.
- **Privacy-first**: prevent sensitive customer data from leaving your infrastructure.
- **Connectors**: use [Supaglue-maintained connectors](/category/connectors), or extend Supaglue by bringing your own connectors.
- **Developer-centric**: self-host multiple instances for local, staging, and production environments.
- **Monitoring and logs**: monitor the status of syncs and stream logs to your cloud.

## How it works

Developers can integrate with Supaglue in an hour or less:

1. Create a Supaglue Cloud account or spin up Supaglue locally, and get your API key.
2. Configure your integration scopes and OAuth credentials.
3. Add an Embedded Link in your application.
4. Create Supaglue customers for each customer using your application.
5. Your customers connect their CRMs to your app, and Supaglue syncs their datainto Supaglue's backend, where it is cached, mapped to a common data model, and exposed through a unified REST API.
6. You access the Supaglue API from within your application, to help read data from and write data to your customers' CRMs.

Supaglue consists of the following components:

- Managed authentication
- Sync engine
- Postgres database
- Common data model
- REST API

Supaglue is a separate service that runs alongside your stack. Supaglue is open source and can be self-hosted.

## Use cases

- **Lead scoring** - sync CRM records into your application to power your proprietary rules and ML models.
- **AI-based workflows** - segment, target, and compose personalized communications based on CRM data.
- **Sales enablement** - manage accounts and opportunities in your customer's CRM via your application UI.
- **CRM enrichment** - log emails, tasks, and product usage metrics to your customers' CRM.

## Roadmap & vision

Read more about where Supaglue is headed [here](/roadmap).

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
