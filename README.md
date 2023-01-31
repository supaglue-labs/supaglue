<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/supaglue-labs/supaglue/main/docs/static/img/logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/supaglue-labs/supaglue/main/docs/static/img/logo-light.png">
  <img alt="Supaglue" src="https://raw.githubusercontent.com/supaglue-labs/supaglue/main/docs/static/img/logo-light.png">
</picture>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@supaglue/cli" target="_blank"><img title="cli latest version" src="https://img.shields.io/npm/v/@supaglue/cli?label=%40supaglue%2Fcli"></a>
  <a href="https://www.npmjs.com/package/@supaglue/nextjs" target="_blank"><img title="nextjs latest version" src="https://img.shields.io/npm/v/@supaglue/nextjs?label=%40supaglue%2Fnextjs"></a>
  <a href="https://github.com/supaglue-labs/supaglue/issues"><img title="github issues" src="https://img.shields.io/github/issues/supaglue-labs/supaglue"></a>
  <a href="https://github.com/supaglue-labs/supaglue"><img title="github forks" src="https://img.shields.io/github/forks/supaglue-labs/supaglue?style=social"></a>
  <a href="https://github.com/supaglue-labs/supaglue"><img title="github stars" src="https://img.shields.io/github/stars/supaglue-labs/supaglue?style=social"></a>
</p>

<p align="center">
[Website](https://supaglue.com?ref=github-readme) • [Getting Started](https://docs.supaglue.com/docs/get-started?ref=github-readme) • [Docs](https://docs.supaglue.com?ref=github-readme) • [Slack](https://supagluecommunity.slack.com/) • [Twitter](https://twitter.com/supaglue_labs)
</p>

# Supaglue

Supaglue is a developer platform for integrating your application with your customer's CRM tools. It lets you define integration logic with code, expose customer-facing UI components in your application for configuring the integration, and monitor your integrations over time. Supaglue takes care of execution and communicating with customer's CRM. Supaglue is open source and can be self-hosted.

## Status

- [x] **Private Alpha**: Testing Supaglue with a closed set of developers
- [x] **Public Alpha**: Anyone can run Supaglue locally using Docker. Go easy on us! We're working on substantial improvements.
- [ ] **Public Beta**: Stable and feature-rich enough to implement in production
- [ ] **Public**: Production-ready for majority of integration use cases with Salesforce

We are currently in Public Alpha. Watch "releases" of this repo to be notified of significant updates (as minor semver releases).

## Features

- **Prebuilt sync templates**: Use ready-made sync templates or customize them to your use case
- **Managed syncs**: Let Supaglue execute syncs for you with fault-tolerance, retries, rate limits, and error handling
- **Integration as code**: Use Typescript as declarative configuration to define syncs
- **Embeddable UI components**: Customer-facing React components that let your customers configure syncs. Fully-functional and customizable
- **Managed authentication**: Offload Oauth flows, storing secrets, and refreshing tokens to Supaglue
- **Open source**: Self-host Supaglue and extend it. Don't worry about compliance

## Get Started

#### Run Supaglue locally with Docker Compose

```shell
git clone git@github.com:supaglue-labs/supaglue.git
cd supaglue
cp .env.sample .env
docker compose up
```

Continue on to the docs to go through an [integration tutorial](https://docs.supaglue.com/get-started#tutorial).

## Roadmap

Check out our [roadmap](roadmap) to get informed on what we are currently working on, and what we have in mind for the next weeks, months and years.

## Community

For general help using Supaglue, please refer to our [documentation](https://docs.supaglue.com). For additional help, you can use one of these channels to chat with us:

- [Slack](https://join.slack.com/t/supagluecommunity/shared_invite/zt-1o2hiozzl-ZRQswNzlT5W4sXwrQnVlDg) - Discuss Supaglue with the team and other developers
- [Github](https://github.com/supaglue-labs/supaglue) - File bug reports and make code contributions
- [Twitter](https://twitter.com/supaglue_labs) - Get the latest news and announcements

## Contributing

Learn about ways to [contribute to Supaglue](contributing).

## License

[MIT License](https://github.com/supaglue-labs/supaglue/blob/main/LICENSE).
