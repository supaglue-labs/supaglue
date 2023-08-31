---
sidebar_position: 1
slug: /
sidebar_label: Introduction
---

# Supaglue: open source product integrations platform

Supaglue is an open-source platform that helps you build native product integrations with your customers' SaaS tools. It provides a suite of developer tools and APIs that lets you sync data into your application database or data warehouse, write directly to your customers' SaaS tools, and subscribe to change events in real-time.

Supaglue works out-of-the-box with managed authentication, monitoring and logging tools, and a growing library of extensible SaaS connectors.

<figure>

![supaglue-quickstart](/img/supaglue-diagram.png)

</figure>

## Integration patterns

Supaglue provides 3 high-level patterns for building your product integration. These can be used independently or in combination:

- **[Managed syncs](./integration-patterns/managed-syncs)** – sync data from your customers' SaaS tools into your application on a schedule.
- **[Unified API](./integration-patterns/unified-api)** – read and write to multiple third-party providers with a single API.
- **[Actions API](./integration-patterns/actions-api)** – read and write to provider-scoped APIs that range from basic CRUD operations to complex actions.
- **[Real-time events](./integration-patterns/real-time-events)** – subscribe to real-time changes in your customers' SaaS tools as a webhook.

## Use cases

- **Lead scoring** - sync CRM records into your application to power your proprietary rules and AI/ML models.
- **CRM enrichment** - log emails, tasks, and product usage metrics to your customers' CRM and sales engagement tools.
- **Workflow automation** triggers real-time customer-facing notifications and workflows based on changes in their SaaS tools.

## How it works

You can integrate Supaglue with your application in about 5 minutes via our
[quickstart](/quickstart):

1. Create a Supaglue Cloud account [here](https://app.supaglue.io/sign-up).
2. Configure your integration scopes and OAuth credentials, or use one of our managed OAuth apps.
3. Create a Supaglue customer.
4. Connect a customer's SaaS platform to your app through a Supaglue-provided embedded link.
5. Access customer data using one of three integration patterns: managed syncs, actions API, or real-time events.

## FAQ

<details>
  <summary>Who should use Supaglue?</summary>
  <div>
    Supaglue targets developers at B2B SaaS companies to provide native product integrations with their customers' SaaS tools in their products.
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

<details>
  <summary>What kind of tracking/analytics do you collect?</summary>
  <div>
    We use PostHog to log anonymized, session-level event data in our API and Sentry for error reporting. We use this to improve the product experience! You can opt out of tracking in the open-source version by setting `SUPAGLUE_DISABLE_ERROR_REPORTING=1` and `SUPAGLUE_DISABLE_ANALYTICS=1` in your `.env` file.
  </div>
</details>

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
