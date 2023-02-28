---
sidebar_position: 4
---

# Architecture

import ThemedImage from '@theme/ThemedImage';

<ThemedImage
alt="Architecture Diagram"
width="75%"
sources={{
    light: ('/img/arch.png'),
    dark: ('/img/arch.png'),
  }}
/>

### Components

- Sync workflows
- Workflow engine (Temporal)
- DB Cache (Postgres)
- Backend API (Nodejs Express)
- Common Model

### Overview

Supaglue is a platform that you can self-host on your infrastructure. It consists of two services, a backend API (Nodejs Express) and workflow engine (Temporal), and a database (Postgres).

The backend API serves four purposes:

1. As a management layer for developers to configure Integrations.
2. As an authentication layer for Customers to authenticate with third-party tools to create Connections.
3. As a serving layer for developers to read/write Common Model objects.
4. As a worker layer for Sync workflows to read/write from third-party tools and cache in Supaglue's database.

The database serves as a place to store two types of data:

1. Supaglue application data (Integrations, Connections, Customers).
2. Data from Customers' third-party tools (raw and Common Model formats).

The workflow engine is responsible for scheduling and executing Sync workflows which move data in/out of Supaglue and third-party tools. There are two general kinds of Syncs:

1. Write sync: this sync will create/update records in third-party tools and then update Supaglue's cache.
2. Read sync
   - Object sync - this sync is responsible for reading one type of third-party object and saving it to Supaglue's database cache in a raw and Common Model format.
   - Association sync - this sync is run after all object syncs, scoped to a Connection, are finished running to associate related objects to one another.
