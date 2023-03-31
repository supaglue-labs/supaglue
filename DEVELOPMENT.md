# Development

### Setup

Run:
```shell
./scripts/setup_dev_env.sh
```

Be sure to copy the `docker-compose.override.dev.yml` to `docker-compose.override.yml` to get the appropriate environment variables.

```shell
cp docker-compose.override.dev.yml docker-compose.override.yml
```

### Running

```shell
cp apps/mgmt-ui/.env.sample apps/mgmt-ui/.env
docker compose up

yarn workspace mgmt-ui dev
```

### Environment variables

`.env`:

- `SUPAGLUE_DEPLOYMENT_ID`: used for developers to opt-in to identifying themselves for analytics
- `SUPAGLUE_API_ENCRYPTION_KEY`: used as a secret to hash API keys and encrypt OAuth credentials.
- `SUPAGLUE_QUICKSTART_API_KEY`: the default API key used for local development. this can be regenerated in the mgmt-ui.
- `SUPAGLUE_DISABLE_ERROR_REPORTING`: set to `1` to disable anonymous Sentry alerts.
- `SUPAGLUE_DISABLE_ANALYTICS`: set to `1` to disable anonymous Posthog analytics.
- `SUPAGLUE_INTERNAL_TOKEN`: the shared token between API and mgmt-ui.

- `DEV_{PROVIDER_NAME}_CLIENT_ID`: OAuth2 client id of your third-party CRM Connected App.
- `DEV_{PROVIDER_NAME}_CLIENT_SECRET`: OAuth2 client id of your third-party CRM Connected App.
- `DEV_{PROVIDER_NAME}_SCOPES`: OAuth2 scopes of your third-party CRM Connected App (csv format).
- `DEV_{PROVIDER_NAME}_APP_ID`: your third-party CRM Connected App id.

`apps/mgmt-ui/.env`

- `SUPAGLUE_API_HOST`: the URL for the Backend API.
- `SUPAGLUE_JWT_SECRET`: secret used for JWT in the mgmt-ui.
- `SUPAGLUE_INTERNAL_TOKEN`: the matching shared token with `.env` in API.
- `NEXTAUTH_URL`: the URL for the mgmt-ui Nextjs app.
