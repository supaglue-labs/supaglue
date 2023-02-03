<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/supaglue-labs/supaglue/main/docs/static/img/logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/supaglue-labs/supaglue/main/docs/static/img/logo-light.png">
  <img alt="Supaglue" src="https://raw.githubusercontent.com/supaglue-labs/supaglue/main/docs/static/img/logo-light.png">
</picture>
</p>

<p align="center">
  <a href="https://github.com/supaglue-labs/supaglue/actions/workflows/ci.yml"><img title="CI Status" src="https://github.com/supaglue-labs/supaglue/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@supaglue/cli" target="_blank"><img title="cli latest version" src="https://img.shields.io/npm/v/@supaglue/cli?label=%40supaglue%2Fcli"></a>
  <a href="https://www.npmjs.com/package/@supaglue/nextjs" target="_blank"><img title="nextjs latest version" src="https://img.shields.io/npm/v/@supaglue/nextjs?label=%40supaglue%2Fnextjs"></a>
  <a href="https://github.com/supaglue-labs/supaglue/issues"><img title="github issues" src="https://img.shields.io/github/issues/supaglue-labs/supaglue"></a>
  <a href="https://github.com/supaglue-labs/supaglue"><img title="github activity" src="https://img.shields.io/github/commit-activity/w/supaglue-labs/supaglue"></a>
  <a href="https://github.com/supaglue-labs/supaglue"><img title="github stars" src="https://img.shields.io/github/stars/supaglue-labs/supaglue?style=social"></a>
</p>

<p align="center">
  <a href="https://supaglue.com?ref=github-readme" target="_blank">Website</a> • <a href="https://docs.supaglue.com/get-started?ref=github-readme" target="_blank">Getting Started</a> • <a href="https://docs.supaglue.com?ref=github-readme" target="_blank">Docs</a> • <a href="https://join.slack.com/t/supagluecommunity/shared_invite/zt-1o2hiozzl-ZRQswNzlT5W4sXwrQnVlDg" target="_blank">Slack</a> • <a href="https://twitter.com/supaglue_labs" target="_blank">Twitter</a>
</p>

# Supaglue

Supaglue is a developer platform for integrating your application with your customer's Salesforce instance. It lets you authenticate with Salesforce, define integrations with code to sync SFDC sObjects, and expose customer-facing UI components in your application. Supaglue takes care of execution, fault-tolerance, and communicating with customer's Salesforce. Supaglue is open source and can be self-hosted to run alongside your stack.

## Status

- [x] **Private Alpha**: Testing Supaglue with a closed set of developers
- [x] **Public Alpha**: Anyone can run Supaglue locally using Docker. Go easy on us! We're working on substantial improvements.
- [ ] **Public Beta**: Stable and feature-rich enough to implement in production
- [ ] **Public**: Production-ready for majority of integration use cases with Salesforce

We are currently in Public Alpha. Watch "releases" of this repo to be notified of significant updates (as minor semver releases).

## Features

- **Integration as code**: Use Typescript as declarative configuration to define syncs.
- **Managed syncs**: Let Supaglue execute syncs for you with fault-tolerance, retries, rate limiting, and error handling.
- **Managed OAuth**: Offload OAuth flows, storing & refreshing tokens to Supaglue
- **Embeddable UI components**: Customer-facing React components that let your customers configure syncs. Fully-functional and customizable.
- **Prebuilt sync templates**: Use ready-made sync templates or customize them to your use case.
- **Open source**: Self-host Supaglue or extend it. Sensitive customer data never leaves your cloud.

## Get Started

#### Run Supaglue locally with Docker Compose

```shell
git clone git@github.com:supaglue-labs/supaglue.git
cd supaglue
echo "SUPAGLUE_API_ENCRYPTION_SECRET=$(openssl rand -base64 32)" >> .env
docker compose up
```

Continue on to the docs to go through an [integration tutorial](https://docs.supaglue.com/tutorial).

## Roadmap

Check out our [roadmap](https://docs.supaglue.com/roadmap) to get informed on what we are currently working on, and what we have in mind for the next weeks, months, and quarters.

## Community

For general help using Supaglue, please refer to our [documentation](https://docs.supaglue.com). For additional help, you can use one of these channels to chat with us:

- [Slack](https://join.slack.com/t/supagluecommunity/shared_invite/zt-1o2hiozzl-ZRQswNzlT5W4sXwrQnVlDg) - Discuss Supaglue with the team and other developers
- [Github](https://github.com/supaglue-labs/supaglue) - File bug reports and make code contributions
- [Twitter](https://twitter.com/supaglue_labs) - Get the latest news and announcements

## Contributing

Learn about ways to [contribute to Supaglue](https://docs.supaglue.com/contributing).

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
