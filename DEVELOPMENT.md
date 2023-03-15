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
docker-compose up
```

### Mgmt-ui

```shell
cp apps/mgmt-ui/.env.sample apps/mgmt-ui/.env
```

Ensure your `SUPAGLUE_INTERNAL_TOKEN` matches between `.env` and `apps/mgmt-ui/.env`. Then, start it:

```shell
yarn workspace mgmt-ui dev
```
