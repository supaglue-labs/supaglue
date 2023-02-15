---
sidebar_position: 7
---

# CLI

The `supaglue` command allows developers to operate on [Developer Config](./concepts#developer-config) and push them to Supaglue Integration Service, as well as query the status of syncs and sync runs, and more.

## Install

```shell
npm install -g @supaglue/cli
```

Ensure you are using a paired version of the CLI with the rest of the Supaglue stack.

## Running the CLI

```shell
supaglue --help
```

## Commands

### apply

`supaglue apply` is the main command used by developers to push Developer Config from their local development environments to the Supaglue Integration Service. Applying Developer Config will create, update, and remove [Syncs](./concepts#sync) running in the Supaglue Integration Service.

Example:

```console
supaglue apply apps/sample-app/supaglue-config
```

### syncs list

`supaglue syncs list` is an operational command that lets you view the status of sync offerings and sync runs of customers.

Example:

```console
supaglue syncs list --customer-id user1
```

### syncs logs

`supaglue syncs logs` is an operational command that lets you view the logs of sync runs for your customers.

Example:

```console
supaglue syncs logs --customer-id user1 --status error
```

### syncs resume

`supaglue syncs resume` is an operational command that lets you resume syncs that have paused due to errors for your customers.

Example:

```console
supaglue syncs resume --customer-id user1 --sync-config-name Opportunities
```


### sync-configs list

`supaglue sync-configs list` is an operational command that lets you view the status of sync configs that have been applied to the system.

Example:

```console
supaglue sync-configs list
```

## Reference

Run `supaglue --help` to see a list of available commands.
