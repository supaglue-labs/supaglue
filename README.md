<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/supaglue-labs/supaglue/main/docs/static/img/logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/supaglue-labs/supaglue/main/docs/static/img/logo-light.png">
  <img alt="Supaglue" src="https://raw.githubusercontent.com/supaglue-labs/supaglue/main/docs/static/img/logo-light.png">
</picture>
</p>

<p align="center">
  <a href="https://hub.docker.com/r/supaglue/api" target="_blank"><img alt="Docker Image Version (latest semver)" src="https://img.shields.io/docker/v/supaglue/api"></a>
  <a href="https://github.com/supaglue-labs/supaglue/actions/workflows/ci.yml"><img title="CI Status" src="https://github.com/supaglue-labs/supaglue/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/supaglue-labs/supaglue/issues"><img title="github issues" src="https://img.shields.io/github/issues/supaglue-labs/supaglue"></a>
  <a href="https://github.com/supaglue-labs/supaglue"><img title="github activity" src="https://img.shields.io/github/commit-activity/w/supaglue-labs/supaglue"></a>
  <a href="https://github.com/supaglue-labs/supaglue"><img title="github stars" src="https://img.shields.io/github/stars/supaglue-labs/supaglue?style=social"></a>
</p>

<p align="center">
  <a href="https://supaglue.com?ref=github-readme" target="_blank">Website</a> • <a href="https://docs.supaglue.com/quickstart?ref=github-readme" target="_blank">Quickstart</a> • <a href="https://docs.supaglue.com?ref=github-readme" target="_blank">Docs</a> • <a href="https://join.slack.com/t/supagluecommunity/shared_invite/zt-1o2hiozzl-ZRQswNzlT5W4sXwrQnVlDg" target="_blank">Slack</a> • <a href="https://twitter.com/supaglue_labs" target="_blank">Twitter</a>
</p>

# Supaglue

Supaglue is an open source developer platform for user-facing product integrations. It provides configurable connectors and platform tools to help developers at B2B companies simplify and scale their integrations with their customers' CRMs and sales stack. Supaglue can be self-hosted and runs alongside your stack.

https://github.com/supaglue-labs/supaglue/assets/1925713/8cc42b76-0118-40fb-950c-9fb8c588b3b5

## Get Started

### Run Supaglue locally

```shell
git clone -b v0.17.6 https://github.com/supaglue-labs/supaglue.git && cd supaglue
./scripts/create_quickstart_env.sh
docker compose up
```

The default login credentials are `username: admin` and `password: admin`. Alternatively, you can set the `ADMIN_PASSWORD` environment variable in the `.env` file created by `./scripts/create_quickstart_env.sh`.

## Features

Supaglue offers 3 main ways to integrate with your customers' providers.

* **Managed Syncs:** managed service that continuously syncs data from your customers' SaaS tools into your application database or data warehouse.
* **Actions API:** single access point to perform common read and write operations against third-party providers.
* **Real-time events:** managed service that sends webhooks to a specified target when records are updated in your customers' SaaS tools.

## Connectors

See the [list of connectors](https://docs.supaglue.com/category/providers) we currently support.

Continue on to the docs to go through our [quickstart](https://docs.supaglue.com/quickstart?ref=github-readme).

## Common use cases

* **Lead scoring:** sync CRM records into your application to power your proprietary rules and AI/ML models.
* **CRM enrichment:** log emails, tasks, and product usage metrics to your customers' CRM and sales engagement tools.
* **Workflow automation:** trigger customer-facing notifications and workflows in real-time based on changes in their SaaS tools.

## Roadmap

Check out our [roadmap](https://github.com/orgs/supaglue-labs/projects/4) to get informed on what we are currently working on, and what we have in mind for the next weeks, months, and quarters.

## Community

For general help using Supaglue, please refer to our [documentation](https://docs.supaglue.com). For additional help, you can use one of these channels to chat with us:

* [Slack](https://join.slack.com/t/supagluecommunity/shared_invite/zt-1o2hiozzl-ZRQswNzlT5W4sXwrQnVlDg) - Discuss Supaglue with the team and other developers
* [Github](https://github.com/supaglue-labs/supaglue) - File bug reports and make code contributions
* [Twitter](https://twitter.com/supaglue_labs) - Get the latest news and announcements

## Contributing

Learn about ways to [contribute to Supaglue](https://docs.supaglue.com/roadmap).

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
