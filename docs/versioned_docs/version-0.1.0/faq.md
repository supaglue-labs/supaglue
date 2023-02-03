---
sidebar_position: 10
---

# FAQ

### What is Supaglue?

Supaglue is an embedded integrations solution built for developers. The core differentiators are that it's open-source, code-centric, and ships with customizable React components you can embed into your product.

As a result, you can ship deep integrations with Supaglue quickly and deploy it on your own infrastructure, enabling seamless integration experiences for your customers.

### Who should use this?

Currently, Supaglue is a good fit for developers at B2B SaaS companies who need to build user-facing Salesforce integrations into their product. Some common use cases would be building Salesforce integrations for sales enablement, sales automation, or marketing automation tools.

### Why is this better than building in-house?

Supaglue helps you ship your embedded Salesforce integration significantly faster by providing the core pieces you'd have to build yourself for free: Salesforce OAuth, workflow execution, UI components. It also handles the operational complexity that comes with Salesforce APIs: retries, rate limiting, and fault tolerance.

### Is there a hosted version of Supaglue?

Not yet. We're planning to have a managed offering of Supaglue (which is how we plan to make money). Please reach out to us at hello@supaglue.com if you’re interested.

### How do I self-host this?

We're early and are working on documentation for self-hosting. Please reach out to us at hello@supaglue.com in the meantime and we can help you get set up.

### When are you going to be production-ready?

We're still early in our journey (public alpha) but hope to be ready soon. Join our [Slack community](https://join.slack.com/t/supagluecommunity/shared_invite/zt-1o2hiozzl-ZRQswNzlT5W4sXwrQnVlDg) and/or sign up for our mailing list for updates!

### Are you planning to support other integrations besides Salesforce?

Yes, absolutely. We're still building out the core platform but have other integrations on our roadmap. You can follow along on our public GitHub roadmap and/or sign up for our mailing list for updates.

### What kind of tracking/analytics do you collect?

We use PostHog to anonymized, session-level event data in our CLI and API to help us improve the developer experience. We use Sentry for error reporting. You can opt out of tracking by setting `SUPAGLUE_DISABLE_ERROR_REPORTING=true` and `SUPAGLUE_DISABLE_ANALYTICS=true` in your `.env` file and by exporting these variables in your shell environment where you run the CLI.