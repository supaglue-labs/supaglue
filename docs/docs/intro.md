---
sidebar_position: 1
slug: /
sidebar_label: Introduction
---

# Supaglue: open source unified CRM API

Supaglue is an open source unified API for CRMs. It handles authentication, caches and normalizes data from multiple CRM platforms, and provides a single set of API endpoints for reading and writing to those CRMs. Developers at B2B companies can use Supaglue to ship native, customer-facing CRM integrations in days.

<figure>

![supaglue-quickstart](/img/social_img.png)

</figure>

## Features

- **Unified API**: single developer interface to read from and write to multiple third-party providers.
- **Common model**: a common data model for CRMs that normalizes core CRM entities and properties across multiple third-party providers.
- **Open source**: self-host and run Supaglue for free.
- **Privacy-first**: prevent sensitive customer data from leaving your infrastructure.
- **Connectors**: use [Supaglue-maintained connectors](connectors), or extend Supaglue by bringing your own connectors.
- **Monitoring and logs**: monitor the status of syncs and stream logs to your cloud.

## Use cases

- **Lead scoring** - sync CRM records into your application to power your proprietary rules and ML models.
- **AI-based workflows** - segment, target, and compose personalized communications based on CRM data.
- **Sales enablement** - manage accounts and opportunities in your customer's CRM via your application UI.
- **CRM enrichment** - log emails, tasks, and product usage metrics to your customers' CRM.

## How it works

You can [integrate Supaglue with your application](/getting-started) in about 15 minutes:

1. Create a Supaglue Cloud account or spin up Supaglue locally, and get your API key.
2. Configure your integration scopes and OAuth credentials.
3. Create Supaglue customers for each customer using your application.
4. Connect an external CRM account to your app through a Supaglue-provided embedded link. The CRM data is synced into Supaglue's backend, where it is cached, mapped to a common data model, and exposed through a unified REST API.
5. Access the Supaglue API from within your application to read/write data to your customers' CRMs.

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
