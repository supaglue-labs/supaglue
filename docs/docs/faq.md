---
sidebar_position: 8
---

# FAQ

## What is Supaglue?

Supaglue is an open source unified API that makes it easy for developers to ship customer-facing CRM integrations. It's open-source, self-hostable, and fully extensible.

## Who should use this?

Currently, Supaglue is a good fit for developers at B2B SaaS companies who need to build user-facing Salesforce integrations into their product. Some common use cases would be building Salesforce integrations for sales enablement, sales automation, or marketing automation tools.

## Why is this better than alternatives?

Supaglue helps you ship customer-facing CRM integrations 10x faster through its unified API and common data model for CRMs. Because it is open source, Supaglue has several advantages over traditional unified APIs: no vendor lock-in, privacy-first, and fully extensible.

## Is there a hosted version of Supaglue?

Not yet. We're planning to have a managed offering of Supaglue (which is how we plan to make money). Please reach out to us at hello@supaglue.com if you’re interested.

## How do I self-host this?

We're early and are working on documentation for self-hosting. Please reach out to us in Slack or at hello@supaglue.com in the meantime and we can help you get set up.

## When are you going to be production-ready?

We're still early in our journey (public alpha) but hope to be ready soon. Join our Slack community and/or sign up for our mailing list for updates!

## Are you planning to support other integrations besides Salesforce and HubSpot?

Yes, see our roadmap for more details.

## What kind of tracking/analytics do you collect?

We use PostHog to anonymized, session-level event data in our API to help us improve the developer experience. We use Sentry for error reporting. You can opt out of tracking by setting SUPAGLUE_DISABLE_ERROR_REPORTING=true and SUPAGLUE_DISABLE_ANALYTICS=true in your .env file.
