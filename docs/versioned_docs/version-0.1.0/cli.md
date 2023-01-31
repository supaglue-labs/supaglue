---
sidebar_position: 7
---

# CLI

The `supaglue` command allows developers to operate on sync configurations and push them to Supaglue Integration Service.

## Installation

```shell
npm install -g @supaglue/cli
```

Ensure you are using a paired version of the CLI with the rest of the Supaglue stack.

## Running the CLI

```shell
supaglue --help
```

## Commands

#### apply

`supaglue apply` is the main command used by developers to push sync configurations from their local development environments to the Supaglue Integration Service. Applying sync configurations will create, update, and remove live syncs running in the Supaglue Integration Service.

Example:

```console
supaglue apply apps/sample-app/supaglue-config
```

#### syncs list

`supaglue syncs list` is an operational command that lets you view the status of sync offerings and sync runs of customers.

Example:

```console
supaglue syncs list --customer-id user1
```

## Reference

Run `supaglue --help` to see a list of available commands.
