---
sidebar_position: 1
slug: /
sidebar_label: Introduction
---

# Supaglue: open source user-facing integrations platform

Supaglue is an open source platform that helps you integrate with their customers' CRM and sales tools. It provides a set of API endpoints and developer tools that lets you sync data into your application database or data warehouse, write directly to your customers' SaaS tools, and subscribe to change events in real-time.

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

1. Create a Supaglue Cloud account or spin up Supaglue locally, and get your API key.
2. Configure your integration scopes and OAuth credentials, or use our hosted app.
3. Create a Supaglue customer.
4. Connect an external CRM account to your app through a Supaglue-provided embedded link.
5. Access customer data using one of three [integration patterns](category/integration-patterns): managed syncs, actions API, or real-time events.

## FAQ

<details>
  <summary>Who should use Supaglue?</summary>
  <div>
    Supaglue is built for developers at B2B SaaS companies who need to build user-facing CRM and Sales engagement integrations into their product. Some common use cases for Supaglue are lead scoring, CRM enrichment, and sales enablement software.
  </div>
</details>

<details>
  <summary>Why is this better than building in-house?</summary>
  <div>
    Supaglue helps you ship customer-facing CRM and Sales engagement integrations 10x faster:
    <ul>
        <li>Supaglue fully manages your customer's authentication flow and handles refreshing access tokens.</li>
        <li>Supaglue handles the rate limits, response errors, and other idiosyncrasies of different CRM providers so you don't have to.</li>
        <li>Supaglue normalizes responses across multiple providers so you don't have to build this abstraction layer yourself.</li>
        <li>Supaglue gives you a unified API to read and write from CRMs.</li>
        <li>Supaglue comes out-of-the-box with tools for managing customers, configuring integrations, and monitoring connection health.</li>
    </ul>
  </div>
</details>

<details>
  <summary>Is there a hosted version of Supaglue?</summary>
  <div>
    Yes! We've opened up Supaglue Cloud for early access. Please <a href="https://form.typeform.com/to/jv9ucMZR">sign up</a> for our waitlist, and our team will reach out to you.
  </div>
</details>

<details>
  <summary>Can I self-host Supaglue?</summary>
  <div>
    Yes! Please reach out to us in Slack or at <a href="mailto:hello@supaglue.com">hello@supaglue.com</a>, and we can help you get set up.
  </div>
</details>

<details>
  <summary>Are you planning to support X connector?</summary>
  <div>
    We support the following <a href="./connectors">connectors</a> today and have many more on our roadmap. If there's a specific one you're looking for, let us know and we may be able to prioritize.
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
    We use PostHog to anonymized, session-level event data in our API to help us improve the developer experience. We use Sentry for error reporting. You can opt out of tracking by setting `SUPAGLUE_DISABLE_ERROR_REPORTING=1` and `SUPAGLUE_DISABLE_ANALYTICS=1` in your `.env` file.
  </div>
</details>

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
