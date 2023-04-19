---
sidebar_position: 10
---

# FAQ

## What is Supaglue?

Supaglue is an open source unified API that makes it easy for developers to ship customer-facing CRM integrations. It's open-source, self-hostable, and fully extensible.

## Who should use this?

Currently, Supaglue is a good fit for developers at B2B SaaS companies who need to build user-facing CRM and Sales engagement integrations into their product. Some common use cases for Supaglue are lead scoring, CRM enrichment, and sales enablement software.

## Why is this better than alternatives?

Supaglue helps you ship customer-facing CRM and Sales engagement integrations 10x faster through its unified API and common data model for CRMs. Because it is open source, Supaglue has several advantages over traditional unified APIs: it has no vendor lock-in, it's privacy-first, and it's fully extensible.

## Is there a hosted version of Supaglue?

Yes! We've opened up Supaglue Cloud for early access. Please [sign up](https://form.typeform.com/to/jv9ucMZR) for our waitlist if interested.

## Can I self-host this?

Yes! Please reach out to us in Slack or at hello@supaglue.com, and we can help you get set up.

## Are you planning to support X connector?

We're building more [connectors](/connectors) and have a bunch more on our roadmap. If there's a specific connector you're looking for, let us know and we may be able to prioritize.

## What kind of tracking/analytics do you collect?

We use PostHog to anonymized, session-level event data in our API to help us improve the developer experience. We use Sentry for error reporting. You can opt out of tracking by setting `SUPAGLUE_DISABLE_ERROR_REPORTING=1` and `SUPAGLUE_DISABLE_ANALYTICS=1` in your `.env` file.
