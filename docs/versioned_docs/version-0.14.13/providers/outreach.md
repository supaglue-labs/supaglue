---
sidebar_custom_props:
  icon: /img/connector_icons/outreach.png
  category: 'Sales engagement'
description: ''
---

# Outreach

## Overview

**Category:** `engagement`

Supaglue uses the Outreach v2 API.

| Feature                              | Available                                             |
| ------------------------------------ | ----------------------------------------------------- |
| Authentication (`oauth2`)            | Yes                                                   |
| Managed syncs                        | Yes                                                   |
| &nbsp;&nbsp;&nbsp; Sync strategies   | `full then incremental` (soft delete not supported\*) |
| Unified API                          | Yes                                                   |
| &nbsp;&nbsp;&nbsp; Data invalidation | Yes                                                   |
| Real-time events                     | No                                                    |
| Passthrough API                      | Yes                                                   |

#### Supported common objects:

- Users
- Contacts
- Sequences
- Sequence States
- Sequence Steps (Unified API create only)
- Mailboxes

#### Supported standard objects:

N/A

#### Supported custom objects:

N/A

## Provider setup

The fastest way to get started with Outreach is to use Supaglue's managed app option (which is enabled by default). This allows Supaglue to automatically configure and manage the OAuth connection between your Outreach and Supaglue accounts.

If you want to use your own Outreach App with Supaglue (recommended for production environments)

, you'll need to create a new app in their Outreach Development portal and set up OAuth API access.

1. Navigate to https://developers.outreach.io/apps and create a new App.

1. Under Feature Selection, check the Oauth API Access option.

1. Copy the Application ID and Secret -- you'll need these when configuring the Outreach connection in Supaglue.

1. Set the Callback URI to https://api.supaglue.io/oauth/callback.

1. Select the API Scopes you need. Here are some scopes that are recommended:

  - `accounts.all`
  - `emailAddresses.all`
  - `mailboxes.all`
  - `sequences.all`
  - `sequenceSteps.all`
  - `sequenceStates.all`
  - `templates.all`
  - `prospects.all`
  - `phoneNumbers.all`
  - `users.all`

1. Save the app.

1. Navigate to app.supaglue.io and create a new Outreach provider under Connectors > Providers.o

1. Paste the Application ID and Secret from your Outreach app, and the scopes you want. (Or use the managed app option if you prefer).
