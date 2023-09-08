---
sidebar_custom_props:
  icon: /img/connector_icons/marketo.png
  category: 'Marketing automation'
description: ''
---

# Marketo

## Overview

Supaglue uses the Marketo REST API.

| Feature                            | Available |
| ---------------------------------- | --------- |
| Authentication                     | Yes       |
| Managed syncs                      | No        |
| Actions API                        | Yes       |
| Real-time events                   | No        |
| Passthrough API                    | Yes       |

Supported common objects:

- Forms (Actions API only)

## Provider setup

To enable the Marketo provider on Supaglue, simply navigate to the Marketo Provider configuration page and click "Enable".

![marketo_auth](/img/marketo_auth.png 'marketo auth config')

## Connection setup

Marketo supports a 2-legged Oauth 2.0 authentication. The customer will need to provide:

- Marketo REST API endpoint
- Client ID
- Client Secret

For instructions on how to retrieve these, please see the [Marketo API documentation](https://developers.marketo.com/rest-api/authentication/).

The easiest way to authenticate Marketo via Supaglue is via [Magic Links](/platform/managed-auth#magic-link), where the customer can input these credentials directly before redirecting back to your application.

![marketo_magic_link](/img/marketo_magic_link.png 'marketo magic link')
