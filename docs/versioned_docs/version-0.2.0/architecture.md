---
sidebar_position: 8
---

# Architecture

Integration as code for building full-stack integrations with your customers' SaaS platforms.

<p align="center">
  <a href="#"><img src="/img/arch.png" alt="Supaglue" width="900px"/></a>
</p>

Supaglue takes a **code-centric** approach, using Typescript as a declarative configuration language, to define how your application should integrate with SaaS platforms. Supaglue is a **full-stack** tool that comes with customizable customer-facing React components and backend systems. Finally, Supaglue is **extensible** using Typescript to configure high-level and low-level components of integrations.

Supaglue consists of the following components:

- **Typescript sync configuration** to declaratively define syncs
- **CLI** to publish sync configuration changes
- **API** to accept requests from your application, Salesforce, and the CLI
- **Workflow engine (Temporal)** to orchestrate and execute syncs
- **Database** to store sync configurations
- **React components** to embed customer-facing UI in your application

With the tool you can:

- Unblock yourself from frontend engineers and designers and implement entire integrations yourself
- Not worry about the nuances of syncs including pagination, error handling, retries, timeouts, api rate limits
- Offload the maintenance and scaling a fault-tolerant queue and horizontally scalable API
- Utilize engineering best-practices using environments, versioning, testing
- Skip working directly with complex and varied vendor APIs
