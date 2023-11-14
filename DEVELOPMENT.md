# Development

### Setup

Run:
```shell
./scripts/setup_dev_env.sh
```

### Running

```shell
docker compose up

yarn workspace mgmt-ui dev
```

### Environment variables

`.env`:

- `SUPAGLUE_DEPLOYMENT_ID`: used for developers to opt-in to identifying themselves for analytics
- `SUPAGLUE_API_ENCRYPTION_KEY`: used as a secret to hash API keys and encrypt OAuth credentials.
- `SUPAGLUE_QUICKSTART_API_KEY`: the default API key used for local development. this can be regenerated in the mgmt-ui.
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

#### Note about Outreach

When developing locally with the Outreach integration, you will have to support https traffic. The easiest way to do this is by using `ngrok` Secure Tunnels and setting  `SUPAGLUE_API_HOST` to your `ngrok`-forwarded URL. Be sure to set the redirect URL to that same URL in your Outreach Oauth settings.
