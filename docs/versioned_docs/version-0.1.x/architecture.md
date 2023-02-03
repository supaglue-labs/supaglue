---
sidebar_position: 8
---

# Architecture

Integration as code for building full-stack integrations with your customers' SaaS platforms.

import ThemedImage from '@theme/ThemedImage';

<ThemedImage
alt="Architecture Diagram"
sources={{
    light: ('/img/arch_diagram_light.png'),
    dark: ('/img/arch_diagram_dark.png'),
  }}
/>

Supaglue takes a **code-centric** approach, using Typescript as a declarative configuration language, to define how your application should integrate with SaaS platforms. Supaglue is a **full-stack** tool that comes with backend and frontend components out-of-the-box. Finally, Supaglue is **customizable** using Typescript for configuring backend and frontend components.

Supaglue consists of the following components:

- **Config SDK** to author [sync configuration](/concepts#developer-config) declaratively
- **CLI** to publish sync configuration changes
- **API** to communicate an coordinate with your application, Salesforce, and Supaglue
- **Workflow engine (Temporal)** to reliably execute [syncs](/concepts#sync)
- **Database** to store developer and customer configurations and credentials
- **React components (Nextjs SDK)** to embed customer-facing UI into your application

With the tool you can:

- Unblock yourself from frontend engineers and designers and implement entire integrations yourself
- Not worry about the nuances of syncs including error handling, retries, timeouts, api rate limits
- Offload the maintenance and scaling a fault-tolerant queue and horizontally scalable API
- Utilize engineering best-practices using code, versioning, testing
- Skip dealing with complex and varied vendor APIs
