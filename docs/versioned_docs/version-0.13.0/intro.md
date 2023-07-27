---
sidebar_position: 1
slug: /
sidebar_label: Introduction
---

# Supaglue: open source product integrations platform

Supaglue is an open source platform that helps you build native product integrations with your customers' SaaS tools. It provides a suite of developer tools and APIs that lets you sync data into your application database or data warehouse, write directly to your customers' SaaS tools, and subscribe to change events in real-time.

Supaglue comes out-of-the-box with managed authentication, monitoring and logging tools, and a growing library of extensible SaaS connectors.

<figure>

![supaglue-quickstart](/img/supaglue-diagram.png)

</figure>

## Integration patterns

- **Managed Syncs**: managed service that continuously syncs data from your customers' SaaS tools into your application database or data warehouse.
- **Actions API**: single access point to perform common read and write operations against third-party providers.
- **Real-time change events**: managed service that sends webhooks to a specified target when records are updated in your customers' SaaS tools.

## Use cases

- **Lead scoring** - sync CRM records into your application to power your proprietary rules and AI/ML models.
- **CRM enrichment** - log emails, tasks, and product usage metrics to your customers' CRM and sales engagement tools.
- **Workflow automation** - trigger customer-facing notifications and workflows in real-time based on changes in their SaaS tools.

## How it works

You can [integrate Supaglue with your application](quickstart) in about 5 minutes:

1. Create a Supaglue Cloud account or spin up Supaglue locally.
2. Configure your integration scopes and OAuth credentials, or use one of our managed OAuth apps.
3. Create a Supaglue customer.
4. Connect a customer's SaaS platform to your app through a Supaglue-provided embedded link.
5. Access customer data using one of three integration patterns: managed syncs, actions API, or real-time events.

## FAQ

<details>
  <summary>Who should use Supaglue?</summary>
  <div>
    Supaglue is aimed at developers at B2B SaaS companies that provide native product integrations with their customers' SaaS tools in their own products.
  </div>
</details>

<details>
  <summary>Why is this better than building in-house?</summary>
  <div>
    Supaglue helps you ship product integrations 10x faster:
    <ul>
        <li>Supaglue fully manages your customer's authentication flow and handles refreshing access tokens.</li>
        <li>Supaglue handles the rate limits, response errors, and other idiosyncrasies of different SaaS APIs so you don't have to.</li>
        <li>Supaglue normalizes responses across multiple providers so you don't have to build this abstraction layer yourself.</li>
        <li>Supaglue provides unified APIs and common schemas so you only have to do the integration work once.</li>
        <li>Supaglue comes out-of-the-box with tools for managing customers, configuring integrations, and monitoring connection health.</li>
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
  <summary>Are you planning to support X connector?</summary>
  <div>
    We support several connectors today and have many more on our roadmap. If there's a specific connector that's not on the list, let us know and we will try to prioritize!
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
    We use PostHog to log anonymized, session-level event data in our API and Sentry for error reporting. This helps us improve the product experience! You can opt out of tracking in the open source version by setting `SUPAGLUE_DISABLE_ERROR_REPORTING=1` and `SUPAGLUE_DISABLE_ANALYTICS=1` in your `.env` file.
  </div>
</details>

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
