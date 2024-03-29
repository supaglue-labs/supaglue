---
sidebar_position: 1
slug: /
sidebar_label: Introduction
---

# Supaglue: open source product integrations platform

Supaglue is an open-source platform that helps you build native product integrations with your customers' SaaS tools. It provides a suite of developer tools and APIs to help you sync data into your application database or data warehouse and write directly to your customers' SaaS tools.

Supaglue works out-of-the-box with managed authentication, monitoring and logging tools, and a growing library of extensible SaaS connectors.

<figure>

![supaglue-quickstart](/img/supaglue-diagram.png)

</figure>

## Integration patterns

Supaglue provides 2 ways for building your product integration. These can be used independently or together:

- **[Managed syncs](./integration-patterns/managed-syncs)** – sync data from your customers' SaaS tools into your application on a schedule, or on-demand.
- **[Unified API](./integration-patterns/unified-api)** – read and write to multiple third-party providers with a single API.

## Use cases

- **Lead scoring** - sync CRM records into your application to power your AI/ML models.
- **CRM enrichment** - create or update contacts, accounts, tasks, and metrics in your customers' CRM and sales engagement tools.
- **Workflow automation** add prospects to email sequences in sales engagement tools.

## How it works

You can integrate Supaglue with your application in about 5 minutes via our
[quickstart](/quickstart):

1. Create a Supaglue Cloud account [here](https://app.supaglue.io/sign-up).
2. Configure your integration scopes and OAuth credentials, or use one of our managed OAuth apps.
3. Create a Supaglue customer.
4. Connect a customer's SaaS platform to your app through a [managed authentication](/platform/managed-auth) option.
5. Configure a [Managed Sync](/integration-patterns/managed-syncs) or start using the [Unified API](/integration-patterns/unified-api).

## FAQ

<details>
  <summary>Who should use Supaglue?</summary>
  <div>
    Supaglue is useful for developers at B2B SaaS companies who are building native product integrations with their customers' SaaS tools.
  </div>
</details>

<details>
  <summary>Why is this better than building in-house?</summary>
  <div>
    Supaglue helps you ship product integrations 10x faster:
    <ul>
        <li>Supaglue fully manages your customer's authentication flow and handles refreshing access tokens.</li>
        <li>Supaglue handles the rate limits, response errors, and other idiosyncrasies of different SaaS APIs, so you don't have to.</li>
        <li>Supaglue normalizes responses across multiple providers, so you don't have to build this abstraction layer yourself.</li>
        <li>Supaglue provides unified APIs and common schemas, so you only have to do the integration work once.</li>
        <li>Supaglue comes out of the box with tools for managing customers, configuring integrations, and monitoring connection health.</li>
    </ul>
  </div>
</details>

<details>
  <summary>Can I self-host Supaglue?</summary>
  <div>
    Yes, please reach out to us in Slack or at <a href="mailto:hello@supaglue.com">hello@supaglue.com</a> so we can better understand your environment and help you get set up.
  </div>
</details>

<details>
  <summary>Are you planning to support X integration?</summary>
  <div>
    We support several dozen providers today and have many more on our roadmap. Let us know if a specific provider is not on the list, and we will try to prioritize!
  </div>
</details>

<details>
  <summary>What's on your product roadmap?</summary>
  <div>
    Our product roadmap and long-term version is <a href="./roadmap">here</a>. We welcome suggestions and feature requests.
  </div>
</details>

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
